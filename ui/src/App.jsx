import { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import WelcomePage from './pages/WelcomePage'
import OrderPage from './pages/OrderPage'
import AdminPage from './pages/AdminPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import PasswordModal from './components/PasswordModal'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome')
  const [orders, setOrders] = useState([])
  const [nextOrderId, setNextOrderId] = useState(1)
  const [adminPassword, setAdminPassword] = useState('000000')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [stock, setStock] = useState([
    { productId: 1, productName: '아메리카노(ICE)', stock: 10 },
    { productId: 2, productName: '아메리카노(HOT)', stock: 15 },
    { productId: 3, productName: '카페라떼', stock: 8 },
    { productId: 4, productName: '카푸치노', stock: 3 },
    { productId: 5, productName: '바닐라라떼', stock: 0 },
    { productId: 6, productName: '카라멜마키아토', stock: 12 }
  ])

  const handleStart = () => {
    setCurrentPage('order')
  }

  const handleGoHome = () => {
    setCurrentPage('welcome')
  }

  const handleNavigate = (page) => {
    if (page === 'admin') {
      setShowPasswordModal(true)
      setPasswordError('')
    } else {
      setCurrentPage(page)
    }
  }

  const handlePasswordConfirm = (password) => {
    if (password === adminPassword) {
      setCurrentPage('admin')
      setShowPasswordModal(false)
      setPasswordError('')
    } else {
      setPasswordError('비밀번호를 다시 입력해 주십시오.')
    }
  }

  const handlePasswordChange = (newPassword) => {
    setAdminPassword(newPassword)
    setShowChangePassword(false)
  }

  const addOrder = (cartItems, totalAmount) => {
    // 재고 확인 및 차감
    const stockUpdates = {};
    for (const item of cartItems) {
      const stockItem = stock.find(s => s.productId === item.productId);
      if (!stockItem) {
        alert(`상품 정보를 찾을 수 없습니다: ${item.productName}`);
        return;
      }
      if (stockItem.stock < item.quantity) {
        alert(`재고가 부족합니다: ${item.productName} (재고: ${stockItem.stock}개, 주문: ${item.quantity}개)`);
        return;
      }
      stockUpdates[item.productId] = (stockUpdates[item.productId] || 0) + item.quantity;
    }

    // 재고 차감
    setStock(prevStock => 
      prevStock.map(item => {
        if (stockUpdates[item.productId]) {
          return { ...item, stock: item.stock - stockUpdates[item.productId] };
        }
        return item;
      })
    );

    const newOrder = {
      orderId: nextOrderId,
      orderTime: new Date(),
      items: cartItems.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.totalPrice,
        options: item.selectedOptions
      })),
      totalAmount: totalAmount,
      status: 'pending'
    }
    setOrders(prevOrders => [...prevOrders, newOrder])
    setNextOrderId(prev => prev + 1)
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { 
              ...order, 
              status: newStatus,
              completedTime: newStatus === 'completed' ? new Date() : order.completedTime
            }
          : order
      )
    )
  }

  const updateStock = (productId, change) => {
    setStock(prevStock => 
      prevStock.map(item => {
        if (item.productId === productId) {
          const newStock = item.stock + change;
          return { ...item, stock: newStock >= 0 ? newStock : 0 };
        }
        return item;
      })
    );
  }

  return (
    <div className="app">
      {currentPage !== 'welcome' && (
        <NavigationBar 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          onGoHome={handleGoHome}
          onOpenPasswordChange={() => setShowChangePassword(true)}
          showSettings={currentPage === 'admin'}
        />
      )}
      <main className="app-content">
        {currentPage === 'welcome' && <WelcomePage onStart={handleStart} />}
        {currentPage === 'order' && <OrderPage onOrder={addOrder} stock={stock} />}
        {currentPage === 'admin' && !showChangePassword && (
          <AdminPage 
            orders={orders} 
            onUpdateOrderStatus={updateOrderStatus}
            stock={stock}
            onUpdateStock={updateStock}
          />
        )}
        {currentPage === 'admin' && showChangePassword && (
          <ChangePasswordPage
            currentPassword={adminPassword}
            onPasswordChange={handlePasswordChange}
            onCancel={() => setShowChangePassword(false)}
          />
        )}
      </main>
      {showPasswordModal && (
        <PasswordModal
          onClose={() => {
            setShowPasswordModal(false)
            setPasswordError('')
          }}
          onConfirm={handlePasswordConfirm}
          errorMessage={passwordError}
        />
      )}
    </div>
  )
}

export default App
