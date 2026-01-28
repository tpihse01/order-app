// 타입 검증 유틸리티 함수

/**
 * 숫자 검증
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드 이름 (에러 메시지용)
 * @param {object} options - 옵션 { min, max, required }
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateNumber = (value, fieldName = '값', options = {}) => {
  const { min, max, required = true } = options;

  if (required && (value === null || value === undefined || value === '')) {
    return { isValid: false, error: `${fieldName}은(는) 필수입니다.` };
  }

  if (value === null || value === undefined || value === '') {
    return { isValid: true, error: null };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName}은(는) 숫자여야 합니다.` };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `${fieldName}은(는) ${min} 이상이어야 합니다.` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `${fieldName}은(는) ${max} 이하여야 합니다.` };
  }

  return { isValid: true, error: null, value: numValue };
};

/**
 * 문자열 검증
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드 이름 (에러 메시지용)
 * @param {object} options - 옵션 { minLength, maxLength, required }
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateString = (value, fieldName = '값', options = {}) => {
  const { minLength, maxLength, required = false } = options;

  if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: false, error: `${fieldName}은(는) 필수입니다.` };
  }

  if (!value) {
    return { isValid: true, error: null };
  }

  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName}은(는) 문자열이어야 합니다.` };
  }

  const trimmedValue = value.trim();

  if (minLength !== undefined && trimmedValue.length < minLength) {
    return { isValid: false, error: `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.` };
  }

  if (maxLength !== undefined && trimmedValue.length > maxLength) {
    return { isValid: false, error: `${fieldName}은(는) 최대 ${maxLength}자 이하여야 합니다.` };
  }

  return { isValid: true, error: null, value: trimmedValue };
};

/**
 * 배열 검증
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드 이름 (에러 메시지용)
 * @param {object} options - 옵션 { minLength, maxLength, required }
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateArray = (value, fieldName = '배열', options = {}) => {
  const { minLength, maxLength, required = true } = options;

  if (required && (!value || !Array.isArray(value))) {
    return { isValid: false, error: `${fieldName}은(는) 배열이어야 합니다.` };
  }

  if (!value || !Array.isArray(value)) {
    return { isValid: true, error: null };
  }

  if (minLength !== undefined && value.length < minLength) {
    return { isValid: false, error: `${fieldName}은(는) 최소 ${minLength}개 이상이어야 합니다.` };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return { isValid: false, error: `${fieldName}은(는) 최대 ${maxLength}개 이하여야 합니다.` };
  }

  return { isValid: true, error: null };
};

/**
 * 객체 검증
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드 이름 (에러 메시지용)
 * @param {Array} requiredFields - 필수 필드 배열
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateObject = (value, fieldName = '객체', requiredFields = []) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { isValid: false, error: `${fieldName}은(는) 객체여야 합니다.` };
  }

  for (const field of requiredFields) {
    if (!(field in value) || value[field] === null || value[field] === undefined) {
      return { isValid: false, error: `${fieldName}에 ${field} 필드가 필요합니다.` };
    }
  }

  return { isValid: true, error: null };
};

/**
 * 메뉴 데이터 검증
 * @param {object} menu - 메뉴 객체
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateMenu = (menu) => {
  const objValidation = validateObject(menu, '메뉴', ['id', 'name', 'price']);
  if (!objValidation.isValid) {
    return objValidation;
  }

  const idValidation = validateNumber(menu.id, '메뉴 ID', { min: 1, required: true });
  if (!idValidation.isValid) {
    return idValidation;
  }

  const nameValidation = validateString(menu.name, '메뉴 이름', { minLength: 1, required: true });
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  const priceValidation = validateNumber(menu.price, '가격', { min: 0, required: true });
  if (!priceValidation.isValid) {
    return priceValidation;
  }

  if (menu.stock !== undefined) {
    const stockValidation = validateNumber(menu.stock, '재고', { min: 0, required: false });
    if (!stockValidation.isValid) {
      return stockValidation;
    }
  }

  return { isValid: true, error: null };
};

/**
 * 주문 아이템 검증
 * @param {object} item - 주문 아이템 객체
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateOrderItem = (item) => {
  const objValidation = validateObject(item, '주문 아이템', ['menu_id', 'quantity', 'item_price']);
  if (!objValidation.isValid) {
    return objValidation;
  }

  const menuIdValidation = validateNumber(item.menu_id, '메뉴 ID', { min: 1, required: true });
  if (!menuIdValidation.isValid) {
    return menuIdValidation;
  }

  const quantityValidation = validateNumber(item.quantity, '수량', { min: 1, required: true });
  if (!quantityValidation.isValid) {
    return quantityValidation;
  }

  const priceValidation = validateNumber(item.item_price, '아이템 가격', { min: 0, required: true });
  if (!priceValidation.isValid) {
    return priceValidation;
  }

  if (item.option_ids && !Array.isArray(item.option_ids)) {
    return { isValid: false, error: '옵션 ID는 배열이어야 합니다.' };
  }

  return { isValid: true, error: null };
};

/**
 * 주문 데이터 검증
 * @param {object} orderData - 주문 데이터 객체
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateOrder = (orderData) => {
  const objValidation = validateObject(orderData, '주문', ['items', 'total_amount']);
  if (!objValidation.isValid) {
    return objValidation;
  }

  const itemsValidation = validateArray(orderData.items, '주문 아이템', { minLength: 1, required: true });
  if (!itemsValidation.isValid) {
    return itemsValidation;
  }

  for (let i = 0; i < orderData.items.length; i++) {
    const itemValidation = validateOrderItem(orderData.items[i]);
    if (!itemValidation.isValid) {
      return { isValid: false, error: `주문 아이템 ${i + 1}: ${itemValidation.error}` };
    }
  }

  const totalAmountValidation = validateNumber(orderData.total_amount, '총 금액', { min: 0, required: true });
  if (!totalAmountValidation.isValid) {
    return totalAmountValidation;
  }

  return { isValid: true, error: null };
};
