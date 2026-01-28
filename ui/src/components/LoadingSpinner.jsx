/**
 * 로딩 스피너 컴포넌트
 * 
 * 데이터 로딩 중임을 표시하는 재사용 가능한 컴포넌트입니다.
 * 
 * @component
 * @param {object} props - 컴포넌트 props
 * @param {string} [props.message='로딩 중...'] - 표시할 메시지
 * @param {string} [props.size='medium'] - 스피너 크기 ('small', 'medium', 'large')
 */
import './LoadingSpinner.css';

function LoadingSpinner({ message = '로딩 중...', size = 'medium' }) {
  return (
    <div className={`loading-spinner-container loading-spinner-${size}`}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
