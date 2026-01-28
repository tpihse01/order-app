/**
 * 로깅 유틸리티 모듈
 * 
 * 개발 환경에서만 콘솔 로그를 출력하는 유틸리티입니다.
 * 프로덕션 환경에서는 로그가 출력되지 않아 성능에 영향을 주지 않습니다.
 * 
 * @module utils/logger
 */

const isDevelopment = import.meta.env.DEV;

/**
 * 로거 객체
 * 
 * 개발 환경에서만 로그를 출력하는 메서드들을 제공합니다.
 * 
 * @namespace logger
 */
export const logger = {
  /**
   * 일반 로그 출력
   * 
   * @param {...any} args - 로그할 인자들
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  /**
   * 에러 로그 출력
   * 
   * 개발 환경에서만 콘솔에 출력됩니다.
   * 프로덕션에서는 에러 추적 서비스로 전송할 수 있습니다.
   * 
   * @param {...any} args - 에러 로그 인자들
   */
  error: (...args) => {
    // 에러는 프로덕션에서도 로깅할 수 있도록 유지하되, 개발 환경에서만 상세 정보 출력
    if (isDevelopment) {
      console.error(...args);
    }
    // 프로덕션에서는 에러 추적 서비스로 전송할 수 있음
  },
  
  /**
   * 경고 로그 출력
   * 
   * @param {...any} args - 경고 로그 인자들
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  /**
   * 정보 로그 출력
   * 
   * @param {...any} args - 정보 로그 인자들
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};
