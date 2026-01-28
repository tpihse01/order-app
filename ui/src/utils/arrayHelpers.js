/**
 * 배열 관련 유틸리티 함수 모듈
 * 
 * 옵션 배열 처리 등의 헬퍼 함수를 제공합니다.
 * 
 * @module utils/arrayHelpers
 */

/**
 * 옵션 배열을 문자열로 변환 (옵션 이름만)
 * 
 * @param {Array} options - 옵션 배열
 * @param {string} nameKey - 옵션 이름 키 (기본값: 'name')
 * @returns {string} 옵션 이름들을 쉼표로 구분한 문자열
 */
export const formatOptionsToString = (options, nameKey = 'name') => {
  if (!options || options.length === 0) {
    return '';
  }
  return options
    .map(opt => {
      // nameKey가 있으면 우선 사용, 없으면 name 또는 optionName 사용
      return opt[nameKey] || opt.name || opt.optionName || '';
    })
    .filter(Boolean) // 빈 문자열 제거
    .join(', ');
};

/**
 * 옵션 ID 배열을 정렬된 문자열로 변환 (비교용)
 * @param {Array} options - 옵션 배열
 * @returns {string} 정렬된 옵션 ID를 하이픈으로 구분한 문자열
 */
export const getSortedOptionIds = (options) => {
  if (!options || options.length === 0) {
    return '';
  }
  return options.map(opt => opt.id).sort().join('-');
};
