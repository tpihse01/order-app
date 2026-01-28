// API 기본 URL
const API_BASE_URL = 'http://localhost:3001/api';

// 공통 fetch 함수
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
    }

    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
}

// 메뉴 관련 API
export const menuAPI = {
  // 메뉴 목록 조회
  getMenus: async () => {
    const response = await apiRequest('/menus');
    return response.data;
  },

  // 메뉴 상세 조회
  getMenu: async (menuId) => {
    const response = await apiRequest(`/menus/${menuId}`);
    return response.data;
  },

  // 재고 수량 변경 (change: 변경량, stock: 직접 값 설정)
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

// 주문 관련 API
export const orderAPI = {
  // 주문 목록 조회
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

  // 주문 생성
  createOrder: async (orderData) => {
    const response = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
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
};

// 인증 관련 API
export const authAPI = {
  // 관리자 비밀번호 인증
  adminLogin: async (password) => {
    const response = await apiRequest('/auth/admin', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    return response;
  },
};

// 설정 관련 API
export const settingsAPI = {
  // 관리자 비밀번호 변경
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
