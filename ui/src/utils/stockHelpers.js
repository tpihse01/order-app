/**
 * 재고 관련 유틸리티 함수 모듈
 * 
 * 재고 조회, 업데이트 등의 헬퍼 함수를 제공합니다.
 * 
 * @module utils/stockHelpers
 */

/**
 * stock 배열에서 productId로 재고 찾기
 * 
 * @param {Array} stock - 재고 배열
 * @param {number} productId - 상품 ID
 * @returns {number} 재고 수량 (없으면 0)
 */
export const findStockByProductId = (stock, productId) => {
  const stockItem = stock.find(s => s.productId === productId);
  return stockItem ? stockItem.stock : 0;
};

/**
 * stock과 menus 상태를 동시에 업데이트하는 헬퍼 함수
 * @param {Function} setStock - stock 상태 업데이트 함수
 * @param {Function} setMenus - menus 상태 업데이트 함수
 * @param {number} productId - 상품 ID
 * @param {number} newStock - 새로운 재고 값
 */
export const updateStockAndMenus = (setStock, setMenus, productId, newStock) => {
  // stock 상태 업데이트
  setStock(prevStock => {
    const updated = prevStock.map(item => 
      item.productId === productId 
        ? { ...item, stock: newStock }
        : item
    );
    return [...updated];
  });
  
  // menus 상태도 업데이트
  setMenus(prevMenus => {
    const updated = prevMenus.map(menu =>
      menu.id === productId
        ? { ...menu, stock: newStock }
        : menu
    );
    return [...updated];
  });
};

/**
 * 여러 상품의 재고를 일괄 차감
 * @param {Function} setStock - stock 상태 업데이트 함수
 * @param {Function} setMenus - menus 상태 업데이트 함수
 * @param {Object} stockUpdates - { productId: 차감할 수량 } 형태의 객체
 */
export const decreaseStockBatch = (setStock, setMenus, stockUpdates) => {
  // stock 상태 즉시 업데이트
  setStock(prevStock =>
    prevStock.map(item => {
      const quantity = stockUpdates[item.productId];
      if (quantity) {
        const newStock = Math.max(0, item.stock - quantity);
        return { ...item, stock: newStock };
      }
      return item;
    })
  );

  // menus 상태도 업데이트
  setMenus(prevMenus =>
    prevMenus.map(menu => {
      const quantity = stockUpdates[menu.id];
      if (quantity) {
        const newStock = Math.max(0, menu.stock - quantity);
        return { ...menu, stock: newStock };
      }
      return menu;
    })
  );
};

/**
 * 모든 재고를 0으로 초기화
 * @param {Function} setStock - stock 상태 업데이트 함수
 * @param {Function} setMenus - menus 상태 업데이트 함수
 */
export const resetAllStockToZero = (setStock, setMenus) => {
  setStock(prevStock => 
    prevStock.map(item => ({ ...item, stock: 0 }))
  );
  
  setMenus(prevMenus =>
    prevMenus.map(menu => ({ ...menu, stock: 0 }))
  );
};
