import './WelcomePage.css';

function WelcomePage({ onStart }) {
  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="logo-icon">☕</div>
          <h1 className="welcome-title">COZY</h1>
          <p className="welcome-subtitle">커피 주문 앱</p>
        </div>
        <button className="start-btn" onClick={onStart}>
          시작하기
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
