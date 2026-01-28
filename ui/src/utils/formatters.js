// 공통 포맷팅 유틸리티 함수

/**
 * 가격을 한국어 형식으로 포맷팅
 * @param {number} price - 포맷팅할 가격
 * @returns {string} 포맷팅된 가격 문자열 (예: "4,000원")
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0원';
  }
  return price.toLocaleString('ko-KR') + '원';
};

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param {Date|string} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열 (예: "1월 28일 16:30:45")
 */
export const formatDate = (date) => {
  if (!date) {
    return '날짜 없음';
  }
  
  // 문자열인 경우 Date 객체로 변환
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return '날짜 없음';
  }
  
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  
  return `${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;
};

/**
 * 날짜를 전체 형식으로 포맷팅 (formatDate와 동일하지만 명확성을 위해 별도 함수 제공)
 * @param {Date|string} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDateFull = formatDate;
