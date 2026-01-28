/**
 * API 클라이언트 모듈
 * 
 * 모든 백엔드 API 호출을 중앙 관리하는 모듈입니다.
 * 에러 처리, 응답 검증, 타입 검증을 포함합니다.
 * 
 * @module api
 */

// 에러 처리 유틸리티 import
import { getErrorMessage, getHttpErrorMessage, classifyError } from './utils/errorHandler.js';
import { validateMenu, validateOrder } from './utils/validators.js';

// API 기본 URL
const API_BASE_URL = 'http://localhost:3001/api';

// 개발 환경에서만 로그를 출력하는 유틸리티
const isDevelopment = import.meta.env.DEV;
const logger = {
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  }
};

/**
 * 공통 API 요청 함수
 * 
 * 모든 API 호출의 기본이 되는 fetch 래퍼 함수입니다.
 * 에러 처리, 응답 검증, 네트워크 오류 감지를 포함합니다.
 * 
 * @param {string} endpoint - API 엔드포인트 경로 (예: '/menus')
 * @param {object} options - fetch 옵션 (method, body, headers 등)
 * @returns {Promise<object>} API 응답 데이터
 * @throws {Error} 네트워크 오류 또는 HTTP 오류
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // 응답이 JSON이 아닐 수 있으므로 확인
    let data;
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      // 에러 응답 처리
      let errorMessage;
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          errorMessage = data.error || getHttpErrorMessage(response.status);
        } catch (e) {
          errorMessage = getHttpErrorMessage(response.status);
        }
      } else {
        const text = await response.text();
        errorMessage = text || getHttpErrorMessage(response.status);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    // 성공 응답 처리
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`서버 응답 형식 오류: ${text || response.statusText}`);
    }

    return data;
  } catch (error) {
    logger.error('API 요청 오류:', error);
    
    // 이미 처리된 에러는 그대로 throw
    if (error.status) {
      throw error;
    }
    
    // 네트워크 오류 처리
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const networkError = new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      networkError.type = 'network';
      throw networkError;
    }
    
    // 기타 오류는 그대로 throw
    throw error;
  }
}

/**
 * 메뉴 관련 API
 * 
 * 메뉴 조회, 재고 관리 등의 API를 제공합니다.
 */
export const menuAPI = {
  /**
   * 메뉴 목록 조회
   * 
   * 모든 메뉴와 옵션 정보를 조회합니다.
   * 
   * @returns {Promise<Array>} 메뉴 배열 (옵션 포함)
   * @throws {Error} API 호출 실패 시
   */
  getMenus: async () => {
    const response = await apiRequest('/menus');
    return response.data;
  },

  // 메뉴 상세 조회
  getMenu: async (menuId) => {
    const response = await apiRequest(`/menus/${menuId}`);
    return response.data;
  },

  /**
   * 재고 수량 변경
   * 
   * 메뉴의 재고를 변경합니다. 변경량(change) 또는 직접 값(stock) 중 하나를 사용합니다.
   * 
   * @param {number} menuId - 메뉴 ID
   * @param {number} [change] - 재고 변경량 (증가/감소)
   * @param {number} [stock] - 직접 설정할 재고 값
   * @returns {Promise<object>} 업데이트된 재고 정보
   * @throws {Error} API 호출 실패 시
   */
  updateStock: async (menuId, change, stock) => {
    const body = stock !== undefined ? { stock } : { change };
    const response = await apiRequest(`/menus/${menuId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  },

  // 모든 재고 초기화
  resetAllStock: async () => {
    const response = await apiRequest('/menus/reset-stock', {
      method: 'POST',
    });
    return response.data;
  },
};

/**
 * 주문 관련 API
 * 
 * 주문 생성, 조회, 상태 변경 등의 API를 제공합니다.
 */
export const orderAPI = {
  /**
   * 주문 목록 조회
   * 
   * 주문 목록을 조회합니다. 상태 필터링 및 탭 필터링을 지원합니다.
   * 
   * @param {object} [params={}] - 쿼리 파라미터
   * @param {string} [params.status] - 주문 상태 필터 ('pending', 'in_progress', 'completed')
   * @param {string} [params.tab] - 탭 필터 ('in-progress', 'completed')
   * @returns {Promise<Array>} 주문 배열
   * @throws {Error} API 호출 실패 시
   */
  getOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.tab) queryParams.append('tab', params.tab);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    const response = await apiRequest(endpoint);
    return response.data;
  },

  // 주문 상세 조회
  getOrder: async (orderId) => {
    const response = await apiRequest(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * 주문 생성
   * 
   * 새 주문을 생성합니다. 주문 생성 시 자동으로 재고가 차감됩니다.
   * 
   * @param {object} orderData - 주문 데이터
   * @param {Array} orderData.items - 주문 항목 배열
   * @param {number} orderData.total_amount - 총 금액
   * @returns {Promise<object>} 생성된 주문 정보
   * @throws {Error} API 호출 실패 또는 재고 부족 시
   */
  createOrder: async (orderData) => {
    // 주문 데이터 검증
    const validation = validateOrder(orderData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const response = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    
    // 응답 검증
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('서버에서 받은 주문 응답 형식이 올바르지 않습니다.');
    }

    return response.data;
  },

  // 주문 상태 변경
  updateOrderStatus: async (orderId, status) => {
    const response = await apiRequest(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  /**
   * 모든 주문 삭제
   * 
   * 모든 주문과 관련 데이터를 삭제합니다.
   * 
   * @returns {Promise<object>} 삭제 결과
   * @throws {Error} API 호출 실패 시
   */
  deleteAllOrders: async () => {
    const response = await apiRequest('/orders', {
      method: 'DELETE',
    });
    return response.data;
  },
};

/**
 * 인증 관련 API
 * 
 * 관리자 인증 등의 API를 제공합니다.
 */
export const authAPI = {
  /**
   * 관리자 비밀번호 인증
   * 
   * 관리자 비밀번호를 확인합니다.
   * 
   * @param {string} password - 관리자 비밀번호
   * @returns {Promise<object>} 인증 결과
   * @throws {Error} API 호출 실패 또는 비밀번호 불일치 시
   */
  adminLogin: async (password) => {
    const response = await apiRequest('/auth/admin', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    return response;
  },
};

/**
 * 설정 관련 API
 * 
 * 앱 설정 관리 API를 제공합니다.
 */
export const settingsAPI = {
  /**
   * 관리자 비밀번호 변경
   * 
   * 관리자 비밀번호를 변경합니다.
   * 
   * @param {string} oldPassword - 기존 비밀번호
   * @param {string} newPassword - 새 비밀번호 (6자리)
   * @returns {Promise<object>} 변경 결과
   * @throws {Error} API 호출 실패 또는 비밀번호 검증 실패 시
   */
  changeAdminPassword: async (oldPassword, newPassword) => {
    const response = await apiRequest('/settings/admin-password', {
      method: 'PATCH',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
    return response;
  },
};
