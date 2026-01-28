// 에러 처리 유틸리티 함수

/**
 * 에러 객체를 사용자 친화적인 메시지로 변환
 * @param {Error|string|unknown} error - 에러 객체 또는 에러 메시지
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export const getErrorMessage = (error, defaultMessage = '오류가 발생했습니다.') => {
  // 문자열인 경우 그대로 반환
  if (typeof error === 'string') {
    return error;
  }

  // Error 객체인 경우
  if (error instanceof Error) {
    const message = error.message;
    
    // 네트워크 오류
    if (error.name === 'TypeError' && (message.includes('fetch') || message.includes('Failed to fetch'))) {
      return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
    
    // 타임아웃 오류
    if (message.includes('timeout') || message.includes('Timeout')) {
      return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }
    
    // 기존 메시지가 있으면 반환
    if (message) {
      return message;
    }
  }

  // 알 수 없는 오류
  return defaultMessage;
};

/**
 * HTTP 상태 코드에 따른 에러 메시지 반환
 * @param {number} statusCode - HTTP 상태 코드
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 상태 코드에 맞는 에러 메시지
 */
export const getHttpErrorMessage = (statusCode, defaultMessage = '요청 처리 중 오류가 발생했습니다.') => {
  const statusMessages = {
    400: '잘못된 요청입니다. 입력값을 확인해주세요.',
    401: '인증이 필요합니다.',
    403: '접근 권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    409: '이미 존재하는 데이터입니다.',
    422: '입력값이 올바르지 않습니다.',
    429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    500: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    502: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    503: '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
    504: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
  };

  return statusMessages[statusCode] || defaultMessage;
};

/**
 * 에러 타입에 따른 분류
 * @param {Error|unknown} error - 에러 객체
 * @returns {object} { type: string, message: string, retryable: boolean }
 */
export const classifyError = (error) => {
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      retryable: false,
    };
  }

  if (error instanceof Error) {
    const message = error.message || '';
    
    // 네트워크 오류
    if (error.name === 'TypeError' && (message.includes('fetch') || message.includes('Failed to fetch'))) {
      return {
        type: 'network',
        message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        retryable: true,
      };
    }
    
    // 타임아웃
    if (message.includes('timeout') || message.includes('Timeout')) {
      return {
        type: 'timeout',
        message: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
        retryable: true,
      };
    }
    
    // HTTP 상태 코드 추출 시도
    const statusMatch = message.match(/\((\d{3})\)/);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1], 10);
      const retryable = statusCode >= 500 || statusCode === 429;
      return {
        type: 'http',
        message: getHttpErrorMessage(statusCode, message),
        retryable,
        statusCode,
      };
    }
    
    return {
      type: 'unknown',
      message: message || '알 수 없는 오류가 발생했습니다.',
      retryable: false,
    };
  }

  return {
    type: 'unknown',
    message: '알 수 없는 오류가 발생했습니다.',
    retryable: false,
  };
};
