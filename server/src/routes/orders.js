/**
 * 주문 관련 API 라우트
 * 
 * 주문 생성, 조회, 상태 변경 등의 엔드포인트를 제공합니다.
 * 
 * @module routes/orders
 */

import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/orders
 * 주문 목록 조회
 * 
 * 주문 목록을 조회합니다. 쿼리 파라미터로 필터링 가능합니다.
 * 
 * @route GET /api/orders
 * @param {string} [query.status] - 주문 상태 필터 ('pending', 'in_progress', 'completed')
 * @param {string} [query.tab] - 탭 필터 ('in-progress', 'completed')
 * @returns {object} 200 - 성공 응답 { success: true, data: Array<Order> }
 * @returns {object} 500 - 서버 오류 { success: false, error: string }
 */
router.get('/', async (req, res) => {
  try {
    const { status, tab } = req.query;

    let whereClause = '';
    let orderClause = '';

    if (tab === 'in-progress') {
      whereClause = "WHERE o.status IN ('pending', 'in_progress')";
      orderClause = 'ORDER BY o.order_time ASC';
    } else if (tab === 'completed') {
      whereClause = "WHERE o.status = 'completed'";
      orderClause = 'ORDER BY COALESCE(o.completed_time, o.order_time) DESC';
    } else if (status) {
      whereClause = `WHERE o.status = $1`;
      orderClause = 'ORDER BY o.order_time DESC';
    } else {
      orderClause = 'ORDER BY o.order_time DESC';
    }

    const ordersQuery = `
      SELECT 
        o.id,
        o.order_time,
        o.completed_time,
        o.status,
        o.total_amount,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_name', m.name,
              'quantity', oi.quantity,
              'item_price', oi.item_price,
              'options', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', opt.id,
                      'name', opt.name,
                      'additional_price', opt.additional_price
                    )
                  )
                  FROM order_item_options oio
                  JOIN options opt ON oio.option_id = opt.id
                  WHERE oio.order_item_id = oi.id
                ),
                '[]'
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      ${whereClause}
      GROUP BY o.id, o.order_time, o.completed_time, o.status, o.total_amount
      ${orderClause}
    `;

    const params = status ? [status] : [];
    const result = await pool.query(ordersQuery, params);

    const orders = result.rows.map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : []
    }));

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: '주문 조회 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/orders/:orderId - 주문 상세 조회
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderQuery = `
      SELECT 
        o.id,
        o.order_time,
        o.completed_time,
        o.status,
        o.total_amount,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_name', m.name,
              'quantity', oi.quantity,
              'item_price', oi.item_price,
              'options', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', opt.id,
                      'name', opt.name,
                      'additional_price', opt.additional_price
                    )
                  )
                  FROM order_item_options oio
                  JOIN options opt ON oio.option_id = opt.id
                  WHERE oio.order_item_id = oi.id
                ),
                '[]'
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      WHERE o.id = $1
      GROUP BY o.id, o.order_time, o.completed_time, o.status, o.total_amount
    `;

    const result = await pool.query(orderQuery, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      });
    }

    const order = {
      ...result.rows[0],
      items: Array.isArray(result.rows[0].items) ? result.rows[0].items : []
    };

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: '주문 조회 중 오류가 발생했습니다.'
    });
  }
});

// POST /api/orders - 주문 생성
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { items, total_amount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: '주문 항목이 필요합니다.'
      });
    }

    if (typeof total_amount !== 'number' || total_amount < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: '유효한 총 금액이 필요합니다.'
      });
    }

    // 재고 확인 및 차감
    for (const item of items) {
      const { menu_id, quantity } = item;

      // 메뉴 재고 조회
      const menuQuery = 'SELECT stock, name FROM menus WHERE id = $1';
      const menuResult = await client.query(menuQuery, [menu_id]);

      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: `메뉴를 찾을 수 없습니다: menu_id ${menu_id}`
        });
      }

      const currentStock = menuResult.rows[0].stock;
      const menuName = menuResult.rows[0].name;

      if (currentStock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `재고가 부족합니다: ${menuName} (재고: ${currentStock}개, 주문: ${quantity}개)`
        });
      }

      // 재고 차감
      const newStock = currentStock - quantity;
      const updateStockQuery = 'UPDATE menus SET stock = $1 WHERE id = $2';
      await client.query(updateStockQuery, [newStock, menu_id]);
    }

    // 주문 생성
    const orderQuery = `
      INSERT INTO orders (order_time, status, total_amount)
      VALUES (CURRENT_TIMESTAMP, 'pending', $1)
      RETURNING id, order_time, status, total_amount
    `;
    const orderResult = await client.query(orderQuery, [total_amount]);
    const orderId = orderResult.rows[0].id;

    // 주문 상세 생성
    for (const item of items) {
      const { menu_id, quantity, option_ids = [], item_price } = item;

      const orderItemQuery = `
        INSERT INTO order_items (order_id, menu_id, quantity, item_price)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const orderItemResult = await client.query(orderItemQuery, [
        orderId,
        menu_id,
        quantity,
        item_price
      ]);
      const orderItemId = orderItemResult.rows[0].id;

      // 주문 상세 옵션 생성
      for (const optionId of option_ids) {
        const orderItemOptionQuery = `
          INSERT INTO order_item_options (order_item_id, option_id)
          VALUES ($1, $2)
        `;
        await client.query(orderItemOptionQuery, [orderItemId, optionId]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: orderId,
        order_time: orderResult.rows[0].order_time,
        status: orderResult.rows[0].status,
        total_amount: orderResult.rows[0].total_amount
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다.'
    });
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:orderId - 주문 상태 변경
router.patch('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주문 상태입니다.'
      });
    }

    // 현재 주문 상태 확인
    const currentOrderQuery = 'SELECT status FROM orders WHERE id = $1';
    const currentResult = await pool.query(currentOrderQuery, [orderId]);

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      });
    }

    const currentStatus = currentResult.rows[0].status;

    // 상태 전환 검증
    if (currentStatus === 'pending' && status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: '주문 접수 상태에서는 제조 중 상태로만 변경할 수 있습니다.'
      });
    }

    if (currentStatus === 'in_progress' && status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: '제조 중 상태에서는 제조 완료 상태로만 변경할 수 있습니다.'
      });
    }

    if (currentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        error: '이미 완료된 주문입니다.'
      });
    }

    // 상태 업데이트
    let updateQuery;
    let params;

    if (status === 'completed') {
      updateQuery = `
        UPDATE orders 
        SET status = $1, completed_time = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, status, completed_time
      `;
      params = [status, orderId];
    } else {
      updateQuery = `
        UPDATE orders 
        SET status = $1 
        WHERE id = $2 
        RETURNING id, status, completed_time
      `;
      params = [status, orderId];
    }

    const result = await pool.query(updateQuery, params);

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        completed_time: result.rows[0].completed_time
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: '주문 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

export default router;
