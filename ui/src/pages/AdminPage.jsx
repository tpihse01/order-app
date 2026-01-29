/**
 * 관리자 페이지 컴포넌트
 * 
 * 주문 현황 대시보드, 재고 관리, 주문 상태 변경을 담당합니다.
 * 
 * @component
 * @param {object} props - 컴포넌트 props
 * @param {Array} [props.orders=[]] - 주문 배열
 * @param {Function} props.onUpdateOrderStatus - 주문 상태 변경 콜백 함수
 * @param {Array} [props.stock=[]] - 재고 정보 배열
 * @param {Function} props.onUpdateStock - 재고 업데이트 콜백 함수
 * @param {Function} props.onResetAllStock - 모든 재고 초기화 콜백 함수
 * @param {Function} props.onConfirmResetAllStock - 재고 초기화 확인 콜백 함수
 * @param {boolean} [props.loading=false] - 로딩 상태
 */
import { useState, useMemo, useCallback } from 'react';
import './AdminPage.css';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice, formatDate, formatDateFull } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { findStockByProductId } from '../utils/stockHelpers';
import { formatOptionsToString } from '../utils/arrayHelpers';
import { validateNumber } from '../utils/validators';

function AdminPage({ orders = [], onUpdateOrderStatus, stock = [], onUpdateStock, onResetAllStock, onConfirmResetAllStock, onResetAllOrders, loading = false }) {
  const [activeTab, setActiveTab] = useState('in-progress');
  const [editingStock, setEditingStock] = useState({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [showOrdersResetConfirm, setShowOrdersResetConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  // 주문 통계를 주문 목록에서 동적으로 계산
  const orderStats = useMemo(() => {
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
      completedOrders: orders.filter(o => o.status === 'completed').length
    };
  }, [orders]);

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const updateStock = useCallback(async (productId, change, stockValue) => {
    if (onUpdateStock) {
      await onUpdateStock(productId, change, stockValue);
    }
  }, [onUpdateStock]);

  const handleStockInputChange = (productId, value) => {
    // 입력값 검증
    if (value === '') {
      setEditingStock(prev => ({
        ...prev,
        [productId]: ''
      }));
      return;
    }

    const validation = validateNumber(value, '재고', { min: 0, required: false });
    if (validation.isValid && validation.value !== undefined) {
      setEditingStock(prev => ({
        ...prev,
        [productId]: validation.value
      }));
    }
    // 유효하지 않은 값은 무시 (입력 중일 수 있음)
  };

  /** - 버튼 클릭: 로컬 상태만 업데이트 (서버 반영은 재고 반영 버튼 클릭 시) */
  const handleStockDecrease = (productId) => {
    const stockItem = stock.find(s => s.productId === productId);
    const currentStock = stockItem != null ? stockItem.stock : 0;
    const editingValue = editingStock[productId];
    const currentDisplayValue = editingValue !== undefined ? editingValue : currentStock;
    const newValue = Math.max(0, currentDisplayValue - 1);
    
    setEditingStock(prev => ({
      ...prev,
      [productId]: newValue
    }));
  };

  /** + 버튼 클릭: 로컬 상태만 업데이트 (서버 반영은 재고 반영 버튼 클릭 시) */
  const handleStockIncrease = (productId) => {
    const stockItem = stock.find(s => s.productId === productId);
    const currentStock = stockItem != null ? stockItem.stock : 0;
    const editingValue = editingStock[productId];
    const currentDisplayValue = editingValue !== undefined ? editingValue : currentStock;
    const newValue = currentDisplayValue + 1;
    
    setEditingStock(prev => ({
      ...prev,
      [productId]: newValue
    }));
  };

  /** 직접 입력한 재고 값을 서버에 반영 (재고 반영 버튼 클릭 시에만) */
  const applyStockInput = useCallback(async (productId) => {
    const stockItem = stock.find(s => s.productId === productId);
    const currentStock = stockItem != null ? stockItem.stock : 0;
    const rawValue = editingStock[productId];
    const numValue = rawValue === '' || rawValue === undefined
      ? currentStock
      : Number(rawValue);

    if (Number.isNaN(numValue) || numValue < 0) {
      setEditingStock(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }
    if (numValue === currentStock) {
      setEditingStock(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }
    try {
      await updateStock(productId, undefined, numValue);
      // 재고 반영 성공 알림
      const productName = stockItem?.productName || '상품';
      setNotification({
        type: 'success',
        message: `변경된 재고 수량이 반영되었습니다. (${productName}: ${currentStock} → ${numValue})`
      });
    } catch (error) {
      // 에러 알림
      setNotification({
        type: 'error',
        message: getErrorMessage(error)
      });
    } finally {
      setEditingStock(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  }, [stock, editingStock, updateStock]);

  const handleStockInputBlur = () => {
    /* blur 시에는 서버 반영하지 않음. 재고 반영 버튼 클릭 시에만 반영 */
  };

  const handleStockInputKeyPress = (e) => {
    if (e.key === 'Enter') e.preventDefault();
    /* Enter 시에도 서버 반영하지 않음. 재고 반영 버튼 클릭 시에만 반영 */
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

  const handleOrderAction = async (order) => {
    if (order.status === 'pending') {
      // 주문 접수 상태에서 제조 시작으로 변경
      if (onUpdateOrderStatus) {
        await onUpdateOrderStatus(order.orderId, 'in_progress');
      }
    } else if (order.status === 'in_progress') {
      // 제조 중 상태에서 제조 완료로 변경
      if (onUpdateOrderStatus) {
        await onUpdateOrderStatus(order.orderId, 'completed');
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

  return (
    <div className="admin-page">
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>관리자 대시보드</h2>
          <button 
            className="reset-dashboard-btn"
            onClick={() => setShowOrdersResetConfirm(true)}
            aria-label="주문 현황 초기화"
          >
            주문 현황 초기화
          </button>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-label">총 주문</div>
            <div className="stat-value">{orderStats.totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">주문 접수</div>
            <div className="stat-value">{orderStats.pendingOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">제조 중</div>
            <div className="stat-value">{orderStats.inProgressOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">제조 완료</div>
            <div className="stat-value">{orderStats.completedOrders}</div>
          </div>
        </div>
      </div>

      <div className="stock-section">
        <div className="stock-section-header">
          <h2>재고 현황</h2>
          <button 
            className="reset-stock-btn"
            onClick={() => setShowResetConfirm(true)}
            aria-label="재고 초기화"
          >
            재고 수량 초기화
          </button>
        </div>
        <div className="stock-grid">
          {stock.map(item => {
            const displayStock = editingStock[item.productId] !== undefined && editingStock[item.productId] !== ''
              ? editingStock[item.productId] 
              : item.stock;
            
            return (
              <div key={item.productId} className="stock-card">
                <div className="stock-info">
                  <h3 className="stock-product-name">{item.productName}</h3>
                  <div className="stock-status-row">
                    <span className={`stock-status ${getStockStatusClass(item.stock)}`}>
                      {getStockStatus(item.stock)}
                    </span>
                  </div>
                </div>
                <div className="stock-controls">
                  <button 
                    className="stock-btn decrease"
                    onClick={() => handleStockDecrease(item.productId)}
                    aria-label="재고 감소"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="stock-input"
                    value={displayStock}
                    onChange={(e) => handleStockInputChange(item.productId, e.target.value)}
                    onBlur={() => handleStockInputBlur(item.productId)}
                    onKeyPress={(e) => handleStockInputKeyPress(e, item.productId)}
                    min="0"
                    aria-label={`${item.productName} 재고 수량`}
                  />
                  <button 
                    className="stock-btn increase"
                    onClick={() => handleStockIncrease(item.productId)}
                    aria-label="재고 증가"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="stock-apply-btn"
                    onClick={() => applyStockInput(item.productId)}
                    aria-label="재고 반영"
                  >
                    재고 반영
                  </button>
                </div>
              </div>
            );
          })}
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
            {loading ? (
              <LoadingSpinner message="주문 목록을 불러오는 중..." />
            ) : inProgressOrders.length === 0 ? (
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
                              ` (${formatOptionsToString(item.options, 'optionName')})`
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
            {loading ? (
              <LoadingSpinner message="주문 목록을 불러오는 중..." />
            ) : completedOrders.length === 0 ? (
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
                              ` (${formatOptionsToString(item.options, 'optionName')})`
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

      {/* 재고 초기화 확인 모달 */}
      {showResetConfirm && (
        <div className="reset-confirm-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="reset-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reset-confirm-header">
              <h3>재고 초기화 확인</h3>
            </div>
            <div className="reset-confirm-body">
              <p>모든 재고를 0으로 초기화하시겠습니까?</p>
              <p className="reset-confirm-warning">이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <div className="reset-confirm-actions">
              <button 
                className="reset-confirm-cancel"
                onClick={() => setShowResetConfirm(false)}
              >
                취소
              </button>
              <button 
                className="reset-confirm-ok"
                onClick={async () => {
                  try {
                    await onConfirmResetAllStock();
                    setShowResetConfirm(false);
                    // 성공 알림 표시
                    setShowResetSuccess(true);
                    setTimeout(() => {
                      setShowResetSuccess(false);
                    }, 3000);
                  } catch (error) {
                    setNotification({ 
                      message: getErrorMessage(error, '재고 초기화 중 오류가 발생했습니다.'), 
                      type: 'error' 
                    });
                  }
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재고 초기화 성공 알림 */}
      {showResetSuccess && (
        <Notification
          message="모든 재고가 0으로 초기화되었습니다."
          type="success"
          onClose={() => setShowResetSuccess(false)}
        />
      )}
      {/* 주문 현황 초기화 확인 모달 */}
      {showOrdersResetConfirm && (
        <div className="reset-confirm-overlay" onClick={() => setShowOrdersResetConfirm(false)}>
          <div className="reset-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reset-confirm-header">
              <h3>주문 현황 초기화 확인</h3>
            </div>
            <div className="reset-confirm-body">
              <p>초기화 하시겠습니까?</p>
              <p className="reset-confirm-warning">모든 주문 데이터가 삭제되며, 이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <div className="reset-confirm-actions">
              <button 
                className="reset-confirm-cancel"
                onClick={() => setShowOrdersResetConfirm(false)}
              >
                취소
              </button>
              <button 
                className="reset-confirm-ok"
                onClick={async () => {
                  try {
                    await onResetAllOrders();
                    setShowOrdersResetConfirm(false);
                    setNotification({ 
                      message: '주문 현황이 초기화되었습니다.', 
                      type: 'success' 
                    });
                  } catch (error) {
                    setNotification({ 
                      message: getErrorMessage(error, '주문 현황 초기화 중 오류가 발생했습니다.'), 
                      type: 'error' 
                    });
                  }
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 범용 알림 */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default AdminPage;
