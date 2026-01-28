import { useState } from 'react';
import './OrderPage.css';

function OrderPage({ onOrder, stock = [] }) {
  const [cart, setCart] = useState([]);

  // 임시 상품 데이터 (나중에 API에서 가져올 예정)
  const [products] = useState([
    {
      id: 1,
      name: '아메리카노(ICE)',
      price: 4000,
      description: '간단한 설명...',
      imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=600&h=600&fit=crop&q=80&auto=format',
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    },
    {
      id: 2,
      name: '아메리카노(HOT)',
      price: 4000,
      description: '간단한 설명...',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop&q=80&auto=format',
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    },
    {
      id: 3,
      name: '카페라떼',
      price: 5000,
      description: '간단한 설명...',
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop&q=80&auto=format',
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    },
    {
      id: 4,
      name: '카푸치노',
      price: 5500,
      description: '간단한 설명...',
      imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=600&fit=crop&q=80&auto=format',
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    },
    {
      id: 5,
      name: '바닐라라떼',
      price: 6000,
      description: '간단한 설명...',
      imageUrl: '/vanilla-latte.png',
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    },
    {
      id: 6,
      name: '카라멜마키아토',
      price: 6500,
      description: '간단한 설명...',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&q=80&auto=format',
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    }
  ]);

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

    // 담기 후 체크박스 초기화
    setSelectedOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[product.id];
      return newOptions;
    });
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

  const getProductStock = (productId) => {
    const stockItem = stock.find(s => s.productId === productId);
    return stockItem ? stockItem.stock : 0;
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleOrder = () => {
    if (cart.length === 0) return;
    
    // 주문을 App.jsx로 전달
    if (onOrder) {
      onOrder(cart, totalAmount);
    }
    
    alert('주문이 완료되었습니다!');
    setCart([]);
    setSelectedOptions({});
  };

  return (
    <div className="order-page">
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
                  const productStock = getProductStock(product.id);
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
                        <p className="stock-warning">재고가 {productStock}개 남았습니다.</p>
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
          <p className="empty-cart">장바구니가 비어있습니다.</p>
        ) : (
          <>
            <div className="cart-items-scrollable">
              {cart.map((item, index) => {
                const uniqueKey = `${item.productId}-${item.selectedOptions.map(o => o.id).sort().join('-')}-${index}`;
                return (
                <div key={uniqueKey} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">
                      {item.productName}
                      {item.selectedOptions.length > 0 && 
                        ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
                      }
                    </span>
                  </div>
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
                  <button 
                    className="remove-btn"
                    onClick={() => removeCartItem(index)}
                    aria-label="아이템 삭제"
                  >
                    ✕
                  </button>
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
