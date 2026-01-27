import './NavigationBar.css';

function NavigationBar({ currentPage, onNavigate }) {
  return (
    <nav className="navigation-bar">
      <div className="nav-logo">COZY-커피 주문 앱</div>
      <div className="nav-tabs">
        <button
          className={`nav-tab ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => onNavigate('order')}
        >
          주문하기
        </button>
        <button
          className={`nav-tab ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          관리자
        </button>
      </div>
    </nav>
  );
}

export default NavigationBar;
