/**
 * 알림 컴포넌트
 * 
 * 사용자에게 알림 메시지를 표시하는 재사용 가능한 컴포넌트입니다.
 * 성공, 에러, 경고, 정보 등 다양한 타입을 지원합니다.
 * 
 * @component
 * @param {object} props - 컴포넌트 props
 * @param {string} props.message - 표시할 메시지
 * @param {string} [props.type='info'] - 알림 타입 ('success', 'error', 'warning', 'info')
 * @param {Function} [props.onClose] - 닫기 콜백 함수
 * @param {boolean} [props.autoClose=true] - 자동 닫기 여부
 * @param {number} [props.duration=3000] - 자동 닫기 지연 시간 (밀리초)
 */
import { useEffect } from 'react';
import './Notification.css';

function Notification({ message, type = 'info', onClose, autoClose = true, duration = 3000 }) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <span className="notification-message">{message}</span>
        {onClose && (
          <button 
            className="notification-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default Notification;
