/**
 * 메뉴 관련 API 라우트
 * 
 * 메뉴 조회, 재고 관리 등의 엔드포인트를 제공합니다.
 * 
 * @module routes/menus
 */

import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/menus
 * 메뉴 목록 조회
 * 
 * 모든 메뉴와 옵션 정보를 조회합니다.
 * 
 * @route GET /api/menus
 * @returns {object} 200 - 성공 응답 { success: true, data: Array<Menu> }
 * @returns {object} 500 - 서버 오류 { success: false, error: string }
 */
router.get('/', async (req, res) => {
  try {
    // 메뉴와 옵션을 함께 조회
    const menusQuery = `
      SELECT 
        m.id,
        m.name,
        m.price,
        m.description,
        m.image_url,
        m.stock,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'name', o.name,
              'additional_price', o.additional_price
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) as options
      FROM menus m
      LEFT JOIN options o ON m.id = o.menu_id
      GROUP BY m.id, m.name, m.price, m.description, m.image_url, m.stock
      ORDER BY m.id
    `;

    const result = await pool.query(menusQuery);
    
    // options를 배열로 변환
    const menus = result.rows.map(menu => ({
      ...menu,
      options: Array.isArray(menu.options) ? menu.options : []
    }));

    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.'
    });
  }
});

// POST /api/menus/reset-stock - 모든 재고를 0으로 초기화 (특수 경로를 먼저 정의)
router.post('/reset-stock', async (req, res) => {
  try {
    const updateQuery = 'UPDATE menus SET stock = 0 RETURNING id, stock';
    const result = await pool.query(updateQuery);

    res.json({
      success: true,
      message: '모든 재고가 0으로 초기화되었습니다.',
      data: {
        updatedCount: result.rows.length,
        menus: result.rows
      }
    });
  } catch (error) {
    console.error('Error resetting stock:', error);
    res.status(500).json({
      success: false,
      error: '재고 초기화 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/menus/:menuId - 메뉴 상세 조회
router.get('/:menuId', async (req, res) => {
  try {
    const { menuId } = req.params;

    const menuQuery = `
      SELECT 
        m.id,
        m.name,
        m.price,
        m.description,
        m.image_url,
        m.stock,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'name', o.name,
              'additional_price', o.additional_price
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) as options
      FROM menus m
      LEFT JOIN options o ON m.id = o.menu_id
      WHERE m.id = $1
      GROUP BY m.id, m.name, m.price, m.description, m.image_url, m.stock
    `;

    const result = await pool.query(menuQuery, [menuId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      });
    }

    const menu = {
      ...result.rows[0],
      options: Array.isArray(result.rows[0].options) ? result.rows[0].options : []
    };

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.'
    });
  }
});

// PATCH /api/menus/:menuId/stock - 재고 수량 변경
router.patch('/:menuId/stock', async (req, res) => {
  try {
    const { menuId } = req.params;
    const { change, stock: newStockValue } = req.body;

    // change 또는 stock 중 하나만 사용
    let finalStock;
    
    if (newStockValue !== undefined) {
      // 직접 재고 값 설정
      if (typeof newStockValue !== 'number' || newStockValue < 0) {
        return res.status(400).json({
          success: false,
          error: '재고는 0 이상의 숫자여야 합니다.'
        });
      }
      finalStock = newStockValue;
    } else if (change !== undefined) {
      // 재고 변경량으로 계산
      if (typeof change !== 'number') {
        return res.status(400).json({
          success: false,
          error: '재고 변경량은 숫자여야 합니다.'
        });
      }

      // 현재 재고 조회
      const currentStockQuery = 'SELECT stock FROM menus WHERE id = $1';
      const currentResult = await pool.query(currentStockQuery, [menuId]);

      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '메뉴를 찾을 수 없습니다.'
        });
      }

      const currentStock = currentResult.rows[0].stock;
      finalStock = currentStock + change;

      if (finalStock < 0) {
        return res.status(400).json({
          success: false,
          error: '재고는 0 이상이어야 합니다.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: '재고 변경량(change) 또는 재고 값(stock)이 필요합니다.'
      });
    }

    // 메뉴 존재 확인
    const menuCheckQuery = 'SELECT id FROM menus WHERE id = $1';
    const menuCheckResult = await pool.query(menuCheckQuery, [menuId]);

    if (menuCheckResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      });
    }

    // 재고 업데이트
    const updateQuery = 'UPDATE menus SET stock = $1 WHERE id = $2 RETURNING id, stock';
    const updateResult = await pool.query(updateQuery, [finalStock, menuId]);

    res.json({
      success: true,
      data: {
        id: updateResult.rows[0].id,
        stock: updateResult.rows[0].stock
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: '재고 수량 변경 중 오류가 발생했습니다.'
    });
  }
});

export default router;
