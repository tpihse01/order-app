import { useState, useMemo } from 'react';
import './AdminPage.css';

function AdminPage({ orders = [], onUpdateOrderStatus, stock = [], onUpdateStock }) {
  const [activeTab, setActiveTab] = useState('in-progress');

  // 주문 통계를 주문 목록에서 동적으로 계산
  const orderStats = useMemo(() => {
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
      completedOrders: orders.filter(o => o.status === 'completed').length
    };
  }, [orders]);

  const updateStock = (productId, change) => {
    if (onUpdateStock) {
      onUpdateStock(productId, change);
    }
  };

  const getStockStatus = (stockCount) => {
    if (stockCount === 0) return '품절';
    if (stockCount < 5) return '주의';
    return '정상';
  };

  const getStockStatusClass = (stockCount) => {
    if (stockCount === 0) return 'status-out-of-stock';
    if (stockCount < 5) return 'status-warning';
    return 'status-normal';
  };

  const handleOrderAction = (order) => {
    if (order.status === 'pending') {
      // 주문 접수 상태에서 제조 시작으로 변경
      if (onUpdateOrderStatus) {
        onUpdateOrderStatus(order.orderId, 'in_progress');
      }
    } else if (order.status === 'in_progress') {
      // 제조 중 상태에서 제조 완료로 변경
      if (onUpdateOrderStatus) {
        onUpdateOrderStatus(order.orderId, 'completed');
      }
    }
  };

  const getOrderButtonText = (status) => {
    switch (status) {
      case 'pending':
        return '제조 시작';
      case 'in_progress':
        return '제조 완료';
      default:
        return '처리';
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '주문 접수';
      case 'in_progress':
        return '제조 중';
      case 'completed':
        return '제조 완료';
      default:
        return '알 수 없음';
    }
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;
  };

  const formatDateFull = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;
  };

  // 진행 중 주문 (pending, in_progress) - 주문 접수 시각 오름차순
  const inProgressOrders = orders
    .filter(order => order.status === 'pending' || order.status === 'in_progress')
    .sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));

  // 완료 주문 (completed) - 제조 완료 시각 내림차순
  const completedOrders = orders
    .filter(order => order.status === 'completed')
    .sort((a, b) => {
      const aCompletedTime = a.completedTime || a.orderTime;
      const bCompletedTime = b.completedTime || b.orderTime;
      return new Date(bCompletedTime) - new Date(aCompletedTime);
    });

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="admin-page">
      <div className="dashboard-section">
        <h2>관리자 대시보드</h2>
        <div className="stats-summary">
          <span>
            총 주문 {orderStats.totalOrders} / 주문 접수 {orderStats.pendingOrders} / 
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
                <div className="stock-status-row">
                  <p className="stock-quantity">{item.stock}개</p>
                  <span className={`stock-status ${getStockStatusClass(item.stock)}`}>
                    {getStockStatus(item.stock)}
                  </span>
                </div>
              </div>
              <div className="stock-controls">
                <button 
                  className="stock-btn decrease"
                  onClick={() => updateStock(item.productId, -1)}
                  aria-label="재고 감소"
                >
                  -
                </button>
                <button 
                  className="stock-btn increase"
                  onClick={() => updateStock(item.productId, 1)}
                  aria-label="재고 증가"
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
        <div className="orders-tabs">
          <button
            className={`orders-tab ${activeTab === 'in-progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('in-progress')}
          >
            진행 중
          </button>
          <button
            className={`orders-tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            완료
          </button>
        </div>
        {activeTab === 'in-progress' && (
          <>
            {inProgressOrders.length === 0 ? (
              <p className="empty-orders">진행 중인 주문이 없습니다.</p>
            ) : (
              <div className="orders-list">
                {inProgressOrders.map(order => (
                  <div key={order.orderId} className={`order-card order-status-${order.status}`}>
                    <div className="order-header">
                      <div className="order-time">
                        {formatDate(order.orderTime)}
                      </div>
                      <div className="order-status-badge">
                        {getOrderStatusText(order.status)}
                      </div>
                    </div>
                    <div className="order-details">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="order-item-name">
                            {item.productName} x {item.quantity}
                            {item.options && item.options.length > 0 && 
                              ` (${item.options.map(opt => opt.optionName || opt.name).join(', ')})`
                            }
                          </span>
                          <span className="order-item-price">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                      <div className="order-total">
                        <span className="order-total-label">주문 금액:</span>
                        <span className="order-total-amount">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                    <div className="order-actions">
                      <button 
                        className={`order-action-btn ${order.status === 'in_progress' ? 'complete-btn' : ''}`}
                        onClick={() => handleOrderAction(order)}
                      >
                        {getOrderButtonText(order.status)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === 'completed' && (
          <>
            {completedOrders.length === 0 ? (
              <p className="empty-orders">완료된 주문이 없습니다.</p>
            ) : (
              <div className="orders-list">
                {completedOrders.map(order => (
                  <div key={order.orderId} className={`order-card order-status-${order.status}`}>
                    <div className="order-header">
                      <div className="order-time-info">
                        <div className="order-time-label">주문: {formatDateFull(order.orderTime)}</div>
                        <div className="order-time-label">완료: {formatDateFull(order.completedTime || order.orderTime)}</div>
                      </div>
                      <div className="order-status-badge">
                        {getOrderStatusText(order.status)}
                      </div>
                    </div>
                    <div className="order-details">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="order-item-name">
                            {item.productName} x {item.quantity}
                            {item.options && item.options.length > 0 && 
                              ` (${item.options.map(opt => opt.optionName || opt.name).join(', ')})`
                            }
                          </span>
                          <span className="order-item-price">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                      <div className="order-total">
                        <span className="order-total-label">주문 금액:</span>
                        <span className="order-total-amount">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                    <div className="order-actions">
                      <span className="order-completed">완료됨</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
