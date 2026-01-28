import { useState, useEffect, useMemo } from 'react';
import './OrderPage.css';

function OrderPage({ onOrder, stock = [], menus = [], stockUpdateKey = 0 }) {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  // menus와 stock prop이 변경되면 products로 변환 (재고 정보 포함)
  // stock이 변경될 때마다 products를 업데이트하여 실시간 반영
  // stockUpdateKey도 의존성에 추가하여 재고 업데이트 시 강제로 실행
  useEffect(() => {
    if (menus && menus.length > 0) {
      const formattedProducts = menus.map(menu => {
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
      setProducts(formattedProducts)
    }
  }, [menus, stock, stockUpdateKey])

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
      alert('품절된 상품입니다.');
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
    const existingItemIndex = cart.findIndex(item => 
      item.productId === cartItem.productId &&
      JSON.stringify(item.selectedOptions.map(o => o.id).sort()) === 
      JSON.stringify(cartItem.selectedOptions.map(o => o.id).sort())
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + 1;
      
      if (newQuantity > productStock) {
        alert(`재고가 부족합니다. (현재 재고: ${productStock}개)`);
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
    const updatedCart = [...cart];
    const item = updatedCart[index];
    const productStock = getProductStock(item.productId);
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      // 수량이 0 이하가 되면 아이템 삭제
      updatedCart.splice(index, 1);
    } else if (change > 0 && newQuantity > productStock) {
      // 재고보다 많이 담으려고 하면 경고
      alert(`재고가 부족합니다. (현재 재고: ${productStock}개)`);
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

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // stock prop을 직접 사용하는 함수 (항상 최신 값 참조)
  // useMemo를 사용하여 stock이 변경될 때만 함수 재생성
  const getProductStock = useMemo(() => {
    return (productId) => {
      const stockItem = stock.find(s => s.productId === productId);
      return stockItem ? stockItem.stock : 0;
    };
  }, [stock]);

  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleOrder = async () => {
    if (cart.length === 0) return;
    
    // 주문을 App.jsx로 전달 (API 호출 포함)
    if (onOrder) {
      try {
        const result = await onOrder(cart, totalAmount);
        console.log('주문 결과:', result);
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
        console.error('주문 처리 오류:', error);
        alert(error.message || '주문 처리 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="order-page">
      {/* 주문 접수 성공 알림 */}
      {showOrderSuccess && (
        <div className="order-success-notification">
          <div className="order-success-content">
            <span className="order-success-icon">✓</span>
            <span className="order-success-message">주문이 접수되었습니다.</span>
            <button 
              className="order-success-close"
              onClick={() => setShowOrderSuccess(false)}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="products-section">
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
                <p className="product-description">{product.description}</p>
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
                const uniqueKey = `${item.productId}-${item.selectedOptions.map(o => o.id).sort().join('-')}-${index}`;
                return (
                <div key={uniqueKey} className="cart-item">
                  <div className="cart-item-row">
                    <span className="cart-item-name">
                      {item.productName}
                      {item.selectedOptions.length > 0 && 
                        ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
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
