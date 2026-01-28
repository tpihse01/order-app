import { useState } from 'react';
import './PasswordModal.css';

function PasswordModal({ onClose, onConfirm, errorMessage }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length === 6) {
      onConfirm(password);
      setPassword('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPassword(value);
  };

  return (
    <div className="password-modal-overlay" onClick={onClose}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <h2>관리자 비밀번호</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="password-modal-form">
          <div className="password-input-group">
            <label htmlFor="password">비밀번호 6자리</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handleInputChange}
              placeholder="000000"
              maxLength="6"
              autoFocus
              className={errorMessage ? 'error' : ''}
            />
            {errorMessage && (
              <p className="error-message">{errorMessage}</p>
            )}
          </div>
          <div className="password-modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="confirm-btn">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordModal;
