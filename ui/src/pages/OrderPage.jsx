/**
 * 주문하기 페이지 컴포넌트
 * 
 * 메뉴 목록 표시, 옵션 선택, 장바구니 관리, 주문 제출을 담당합니다.
 * 
 * @component
 * @param {object} props - 컴포넌트 props
 * @param {Function} props.onOrder - 주문 제출 콜백 함수
 * @param {Array} [props.stock=[]] - 재고 정보 배열
 * @param {Array} [props.menus=[]] - 메뉴 배열
 * @param {number} [props.stockUpdateKey=0] - 재고 업데이트 강제 리렌더링 키
 * @param {boolean} [props.loading=false] - 로딩 상태
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import './OrderPage.css';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';
import { logger } from '../utils/logger';
import { formatPrice } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { findStockByProductId } from '../utils/stockHelpers';
import { getSortedOptionIds, formatOptionsToString } from '../utils/arrayHelpers';
import { validateNumber } from '../utils/validators';

function OrderPage({ onOrder, stock = [], menus = [], stockUpdateKey = 0, loading = false }) {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  // menus와 stock prop이 변경되면 products로 변환 (재고 정보 포함)
  // useMemo로 최적화하여 불필요한 재계산 방지
  const formattedProducts = useMemo(() => {
    if (!menus || menus.length === 0) {
      return []
    }
    return menus.map(menu => {
      // stock prop에서 해당 메뉴의 재고 정보 찾기 (항상 최신 값)
      const stockItem = stock.find(s => s.productId === menu.id)
      const currentStock = stockItem ? stockItem.stock : menu.stock
      return {
        id: menu.id,
        name: menu.name,
        price: menu.price,
        description: menu.description || '간단한 설명...',
        imageUrl: menu.image_url || null,
        stock: currentStock, // stock prop 우선 사용
        options: (menu.options || []).map(opt => ({
          id: opt.id,
          name: opt.name,
          additionalPrice: opt.additional_price || 0
        }))
      }
    })
  }, [menus, stock, stockUpdateKey])

  // formattedProducts가 변경될 때만 products 상태 업데이트
  useEffect(() => {
    setProducts(formattedProducts)
  }, [formattedProducts])

  const [selectedOptions, setSelectedOptions] = useState({});

  const handleOptionChange = (productId, optionId, checked) => {
    setSelectedOptions(prev => {
      const productOptions = prev[productId] || [];
      if (checked) {
        return {
          ...prev,
          [productId]: [...productOptions, optionId]
        };
      } else {
        return {
          ...prev,
          [productId]: productOptions.filter(id => id !== optionId)
        };
      }
    });
  };

  const addToCart = (product) => {
    const productStock = getProductStock(product.id);
    
    if (productStock === 0) {
      setNotification({ message: '품절된 상품입니다.', type: 'warning' });
      return;
    }

    const selectedProductOptions = (selectedOptions[product.id] || [])
      .map(optionId => product.options.find(opt => opt.id === optionId))
      .filter(Boolean);

    const cartItem = {
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      selectedOptions: selectedProductOptions,
      quantity: 1,
      totalPrice: product.price + selectedProductOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0)
    };

    // 동일한 상품과 옵션 조합이 있는지 확인
    const cartItemOptionIds = getSortedOptionIds(cartItem.selectedOptions);
    const existingItemIndex = cart.findIndex(item => 
      item.productId === cartItem.productId &&
      getSortedOptionIds(item.selectedOptions) === cartItemOptionIds
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + 1;
      
      if (newQuantity > productStock) {
        setNotification({ message: `재고가 부족합니다. (현재 재고: ${productStock}개)`, type: 'warning' });
        return;
      }
      
      updatedCart[existingItemIndex].quantity = newQuantity;
      updatedCart[existingItemIndex].totalPrice = 
        updatedCart[existingItemIndex].basePrice * updatedCart[existingItemIndex].quantity +
        updatedCart[existingItemIndex].selectedOptions.reduce((sum, opt) => 
          sum + opt.additionalPrice * updatedCart[existingItemIndex].quantity, 0);
      setCart(updatedCart);
    } else {
      setCart([...cart, cartItem]);
    }

    // 담기 후 모든 메뉴의 체크박스 초기화
    setSelectedOptions({});
  };

  const updateCartItemQuantity = (index, change) => {
    // 입력값 검증
    const changeValidation = validateNumber(change, '수량 변경', { required: true });
    if (!changeValidation.isValid) {
      return;
    }

    if (index < 0 || index >= cart.length) {
      logger.error('유효하지 않은 장바구니 인덱스:', index);
      return;
    }

    const updatedCart = [...cart];
    const item = updatedCart[index];
    
    if (!item) {
      logger.error('장바구니 아이템을 찾을 수 없습니다:', index);
      return;
    }

    const productStock = getProductStock(item.productId);
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      // 수량이 0 이하가 되면 아이템 삭제
      updatedCart.splice(index, 1);
    } else if (change > 0 && newQuantity > productStock) {
      // 재고보다 많이 담으려고 하면 경고
      setNotification({ message: `재고가 부족합니다. (현재 재고: ${productStock}개)`, type: 'warning' });
      return;
    } else {
      updatedCart[index].quantity = newQuantity;
      updatedCart[index].totalPrice = 
        updatedCart[index].basePrice * newQuantity +
        updatedCart[index].selectedOptions.reduce((sum, opt) => 
          sum + opt.additionalPrice * newQuantity, 0);
    }
    
    setCart(updatedCart);
  };

  const removeCartItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  // stock prop을 직접 사용하는 함수 (항상 최신 값 참조)
  // useCallback을 사용하여 stock이 변경될 때만 함수 재생성
  const getProductStock = useCallback((productId) => {
    return findStockByProductId(stock, productId);
  }, [stock]);

  // 장바구니 총 금액 계산을 useMemo로 최적화
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const handleOrder = async () => {
    if (cart.length === 0) return;
    
    // 주문을 App.jsx로 전달 (API 호출 포함)
    if (onOrder) {
      try {
        const result = await onOrder(cart, totalAmount);
        logger.log('주문 결과:', result);
        // 주문 성공 시 장바구니 비우기 및 알림 표시
        setCart([]);
        setSelectedOptions({});
        // 알림 메시지 표시 (React 컴포넌트로)
        setShowOrderSuccess(true);
        // 3초 후 자동으로 사라지게
        setTimeout(() => {
          setShowOrderSuccess(false);
        }, 3000);
      } catch (error) {
        logger.error('주문 처리 오류:', error);
        setNotification({ 
          message: getErrorMessage(error, '주문 처리 중 오류가 발생했습니다.'), 
          type: 'error' 
        });
      }
    }
  };

  return (
    <div className="order-page">
      {/* 주문 접수 성공 알림 */}
      {showOrderSuccess && (
        <Notification
          message="주문이 접수되었습니다."
          type="success"
          onClose={() => setShowOrderSuccess(false)}
        />
      )}
      {/* 범용 알림 */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="products-section">
        {loading && products.length === 0 && (!menus || menus.length === 0) ? (
          <LoadingSpinner message="메뉴를 불러오는 중..." />
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} loading="lazy" />
                ) : (
                  <div className="image-placeholder">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                      <line x1="4" y1="4" x2="20" y2="20" />
                      <line x1="20" y1="4" x2="4" y2="20" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{formatPrice(product.price)}</p>
              </div>
              <div className="product-options">
                {product.options.map(option => (
                  <label key={option.id} className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={(selectedOptions[product.id] || []).includes(option.id)}
                      onChange={(e) => handleOptionChange(product.id, option.id, e.target.checked)}
                    />
                    <span>
                      {option.name} {option.additionalPrice > 0 ? `(+${formatPrice(option.additionalPrice)})` : '(+0원)'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="product-actions">
                {(() => {
                  // products 상태에서 직접 재고 가져오기 (항상 최신 값)
                  const productStock = product.stock !== undefined ? product.stock : getProductStock(product.id);
                  const isOutOfStock = productStock === 0;
                  const isLowStock = productStock > 0 && productStock <= 10;
                  
                  return (
                    <>
                      <button 
                        className={`add-to-cart-btn ${isOutOfStock ? 'out-of-stock' : ''}`}
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock ? '품절' : '담기'}
                      </button>
                      {isLowStock ? (
                        <p className="stock-warning">재고 {productStock}개</p>
                      ) : (
                        <p className="stock-warning" style={{ visibility: 'hidden' }}>&nbsp;</p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="empty-products">
            <p>메뉴가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="cart-section">
        <h2 className="cart-title">장바구니</h2>
        {cart.length === 0 ? (
          <p className="empty-cart">
            장바구니가<br />비어있습니다
          </p>
        ) : (
          <>
            <div className="cart-items-scrollable">
              {cart.map((item, index) => {
                const uniqueKey = `${item.productId}-${getSortedOptionIds(item.selectedOptions)}-${index}`;
                return (
                <div key={uniqueKey} className="cart-item">
                  <div className="cart-item-row">
                    <span className="cart-item-name">
                      {item.productName}
                      {item.selectedOptions.length > 0 && 
                        ` (${formatOptionsToString(item.selectedOptions)})`
                      }
                    </span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeCartItem(index)}
                      aria-label="아이템 삭제"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="cart-item-row">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn minus"
                        onClick={() => updateCartItemQuantity(index, -1)}
                        aria-label="수량 감소"
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn plus"
                        onClick={() => updateCartItemQuantity(index, 1)}
                        aria-label="수량 증가"
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-price">{formatPrice(item.totalPrice)}</span>
                  </div>
                </div>
              );
              })}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>총 금액 <strong>{formatPrice(totalAmount)}</strong></span>
              </div>
              <button 
                className="order-btn"
                onClick={handleOrder}
              >
                주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderPage;
