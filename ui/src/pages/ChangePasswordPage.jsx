import { useState } from 'react';
import './ChangePasswordPage.css';

function ChangePasswordPage({ onPasswordChange, onCancel }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length !== 6) {
      setError('새 비밀번호는 6자리여야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword === oldPassword) {
      setError('새 비밀번호는 이전 비밀번호와 달라야 합니다.');
      return;
    }

    // API 호출은 App.jsx에서 처리
    if (onPasswordChange) {
      await onPasswordChange(oldPassword, newPassword);
    }
  };

  const handleInputChange = (e, setter) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setter(value);
    setError('');
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <h2>비밀번호 변경</h2>
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="password-input-group">
            <label htmlFor="old-password">이전 비밀번호</label>
            <input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => handleInputChange(e, setOldPassword)}
              placeholder="000000"
              maxLength="6"
            />
          </div>

          <div className="password-input-group">
            <label htmlFor="new-password">새 비밀번호</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => handleInputChange(e, setNewPassword)}
              placeholder="000000"
              maxLength="6"
            />
          </div>

          <div className="password-input-group">
            <label htmlFor="confirm-password">새 비밀번호 확인</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => handleInputChange(e, setConfirmPassword)}
              placeholder="000000"
              maxLength="6"
            />
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              취소
            </button>
            <button type="submit" className="submit-btn">
              변경
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
