import { useState } from 'react';
import './AdminPage.css';

function AdminPage() {
  // 임시 데이터 (나중에 API에서 가져올 예정)
  const [stock, setStock] = useState([
    { productId: 1, productName: '아메리카노 (ICE)', stock: 10 },
    { productId: 2, productName: '아메리카노 (HOT)', stock: 15 },
    { productId: 3, productName: '카페라떼', stock: 8 }
  ]);

  const [orders] = useState([
    {
      orderId: 1,
      orderTime: new Date('2026-01-26T13:00:00'),
      items: [
        { productName: '아메리카노(ICE)', quantity: 1, price: 4000, options: [] }
      ],
      totalAmount: 4000,
      status: 'pending'
    }
  ]);

  const [orderStats] = useState({
    totalOrders: 10,
    receivedOrders: 5,
    inProgressOrders: 2,
    completedOrders: 3
  });

  const updateStock = (productId, change) => {
    setStock(prevStock => 
      prevStock.map(item => {
        if (item.productId === productId) {
          const newStock = item.stock + change;
          return { ...item, stock: newStock >= 0 ? newStock : 0 };
        }
        return item;
      })
    );
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="admin-page">
      <div className="dashboard-section">
        <h2>관리자 대시보드</h2>
        <div className="stats-summary">
          <span>
            총 주문 {orderStats.totalOrders} / 주문 접수 {orderStats.receivedOrders} / 
            제조 중 {orderStats.inProgressOrders} / 제조 완료 {orderStats.completedOrders}
          </span>
        </div>
      </div>

      <div className="stock-section">
        <h2>재고 현황</h2>
        <div className="stock-grid">
          {stock.map(item => (
            <div key={item.productId} className="stock-card">
              <div className="stock-info">
                <h3 className="stock-product-name">{item.productName}</h3>
                <p className="stock-quantity">{item.stock}개</p>
              </div>
              <div className="stock-controls">
                <button 
                  className="stock-btn decrease"
                  onClick={() => updateStock(item.productId, -1)}
                >
                  -
                </button>
                <button 
                  className="stock-btn increase"
                  onClick={() => updateStock(item.productId, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="orders-section">
        <h2>주문 현황</h2>
        {orders.length === 0 ? (
          <p className="empty-orders">대기 중인 주문이 없습니다.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.orderId} className="order-card">
                <div className="order-time">
                  {formatDate(order.orderTime)}
                </div>
                <div className="order-details">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="order-item-name">
                        {item.productName} x {item.quantity}
                        {item.options && item.options.length > 0 && 
                          ` (${item.options.map(opt => opt.optionName).join(', ')})`
                        }
                      </span>
                      <span className="order-item-price">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-actions">
                  <button className="order-action-btn">
                    {order.status === 'pending' ? '주문 접수' : 
                     order.status === 'received' ? '제조 중' :
                     order.status === 'in_progress' ? '제조 완료' : '완료'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
