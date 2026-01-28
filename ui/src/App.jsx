import { useState, useEffect } from 'react'
import NavigationBar from './components/NavigationBar'
import WelcomePage from './pages/WelcomePage'
import OrderPage from './pages/OrderPage'
import AdminPage from './pages/AdminPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import PasswordModal from './components/PasswordModal'
import { menuAPI, orderAPI, authAPI, settingsAPI } from './api'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome')
  const [orders, setOrders] = useState([])
  const [menus, setMenus] = useState([])
  const [stock, setStock] = useState([])
  const [stockUpdateKey, setStockUpdateKey] = useState(0) // 재고 업데이트 강제 리렌더링용
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)

  // 메뉴 및 재고 정보 로드
  useEffect(() => {
    loadMenus()
  }, [])

  // 페이지 전환 시 데이터 로드
  useEffect(() => {
    if (currentPage === 'admin') {
      loadOrders()
      loadMenus() // 재고 정보도 함께 갱신
    }
    // 주문하기 화면으로 들어올 때마다 서버에서 최신 재고 반영
    // (관리자에서 재고 변경 시 OrderPage는 unmount 상태라서 state를 못 받음)
    if (currentPage === 'order') {
      loadMenus()
    }
  }, [currentPage])

  // 주문하기 화면이 활성화되어 있을 때 주기적으로 재고 정보 갱신 (다른 단말기에서 변경된 재고 반영)
  useEffect(() => {
    if (currentPage !== 'order') {
      return // 주문하기 화면이 아니면 폴링 중지
    }

    // 즉시 한 번 로드
    loadMenus()

    // 1초마다 재고 정보 갱신 (다른 단말기에서 변경된 재고를 실시간으로 반영)
    const intervalId = setInterval(() => {
      loadMenus()
    }, 1000) // 1초 간격

    // 컴포넌트 언마운트 또는 페이지 전환 시 인터벌 정리
    return () => {
      clearInterval(intervalId)
    }
  }, [currentPage])

  const loadMenus = async () => {
    try {
      const menusData = await menuAPI.getMenus()
      setMenus(menusData)
      // 재고 정보를 stock 형식으로 변환
      const stockData = menusData.map(menu => ({
        productId: menu.id,
        productName: menu.name,
        stock: menu.stock
      }))
      setStock(stockData)
    } catch (error) {
      console.error('메뉴 로드 실패:', error)
      alert('메뉴를 불러오는 중 오류가 발생했습니다.')
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      // 모든 주문을 가져오기 위해 tab 파라미터 없이 호출
      const ordersData = await orderAPI.getOrders()
      // API 응답 형식을 프론트엔드 형식으로 변환
      const formattedOrders = ordersData.map(order => ({
        orderId: order.id,
        orderTime: new Date(order.order_time),
        completedTime: order.completed_time ? new Date(order.completed_time) : null,
        status: order.status,
        totalAmount: order.total_amount,
        items: (order.items || []).map(item => ({
          productName: item.menu_name,
          quantity: item.quantity,
          price: item.item_price,
          options: item.options || []
        }))
      }))
      setOrders(formattedOrders)
    } catch (error) {
      console.error('주문 로드 실패:', error)
      alert('주문 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

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

  const handlePasswordConfirm = async (password) => {
    try {
      await authAPI.adminLogin(password)
      setCurrentPage('admin')
      setShowPasswordModal(false)
      setPasswordError('')
      // 관리자 페이지 진입 시 주문 목록 로드
      loadOrders()
    } catch (error) {
      setPasswordError(error.message || '비밀번호를 다시 입력해 주십시오.')
    }
  }

  const handlePasswordChange = async (oldPassword, newPassword) => {
    try {
      await settingsAPI.changeAdminPassword(oldPassword, newPassword)
      alert('비밀번호가 변경되었습니다.')
      setShowChangePassword(false)
    } catch (error) {
      alert(error.message || '비밀번호 변경 중 오류가 발생했습니다.')
    }
  }

  const addOrder = async (cartItems, totalAmount) => {
    try {
      // API 형식으로 변환
      const orderItems = cartItems.map(item => ({
        menu_id: item.productId,
        quantity: item.quantity,
        option_ids: item.selectedOptions.map(opt => opt.id),
        item_price: item.totalPrice
      }))

      await orderAPI.createOrder({
        items: orderItems,
        total_amount: totalAmount
      })

      // 주문 성공 후 재고 정보 즉시 갱신 (실시간 반영)
      // 주문된 각 아이템의 재고를 차감
      const stockUpdates = {}
      cartItems.forEach(item => {
        stockUpdates[item.productId] = (stockUpdates[item.productId] || 0) + item.quantity
      })

      // stock 상태 즉시 업데이트
      setStock(prevStock =>
        prevStock.map(item => {
          const quantity = stockUpdates[item.productId]
          if (quantity) {
            const newStock = Math.max(0, item.stock - quantity)
            return { ...item, stock: newStock }
          }
          return item
        })
      )

      // menus 상태도 업데이트
      setMenus(prevMenus =>
        prevMenus.map(menu => {
          const quantity = stockUpdates[menu.id]
          if (quantity) {
            const newStock = Math.max(0, menu.stock - quantity)
            return { ...menu, stock: newStock }
          }
          return menu
        })
      )
      
      // 성공 반환 (알림은 OrderPage에서 표시)
      return { success: true }
    } catch (error) {
      // 에러는 OrderPage에서 처리하도록 throw
      throw error
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      // 주문 목록 갱신
      await loadOrders()
    } catch (error) {
      alert(error.message || '주문 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const updateStock = async (productId, change, stockValue) => {
    try {
      const result = await menuAPI.updateStock(productId, change, stockValue)
      // API 응답으로 받은 재고 값으로 즉시 상태 업데이트 (실시간 반영)
      // result는 { id, stock } 형태
      const newStock = result.stock
      
      if (newStock === undefined) {
        console.error('API 응답에 stock이 없습니다:', result)
        return
      }
      
      // stock 상태 즉시 업데이트 (새로운 배열 참조 생성으로 React 리렌더링 강제)
      setStock(prevStock => {
        const updated = prevStock.map(item => 
          item.productId === productId 
            ? { ...item, stock: newStock }
            : item
        )
        return [...updated]
      })
      
      // menus 상태도 업데이트 (재고 정보 포함)
      setMenus(prevMenus => {
        const updated = prevMenus.map(menu =>
          menu.id === productId
            ? { ...menu, stock: newStock }
            : menu
        )
        return [...updated]
      })
      
      // 강제 리렌더링 트리거 (OrderPage가 stock 변경을 확실히 감지하도록)
      setStockUpdateKey(prev => prev + 1)
    } catch (error) {
      console.error('재고 업데이트 오류:', error)
      alert(error.message || '재고 수량 변경 중 오류가 발생했습니다.')
    }
  }

  const resetAllStock = async () => {
    // 확인은 AdminPage에서 React 컴포넌트로 처리
    // 여기서는 바로 실행하지 않고 확인 필요 플래그 반환
    return { needsConfirmation: true }
  }

  const confirmResetAllStock = async () => {
    try {
      await menuAPI.resetAllStock()
      // 모든 재고를 0으로 즉시 업데이트 (실시간 반영)
      setStock(prevStock => 
        prevStock.map(item => ({ ...item, stock: 0 }))
      )
      
      setMenus(prevMenus =>
        prevMenus.map(menu => ({ ...menu, stock: 0 }))
      )
      
      return { success: true }
    } catch (error) {
      throw error
    }
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
        {currentPage === 'order' && <OrderPage onOrder={addOrder} stock={stock} menus={menus} stockUpdateKey={stockUpdateKey} />}
        {currentPage === 'admin' && !showChangePassword && (
          <AdminPage 
            orders={orders} 
            onUpdateOrderStatus={updateOrderStatus}
            stock={stock}
            onUpdateStock={updateStock}
            onResetAllStock={resetAllStock}
            onConfirmResetAllStock={confirmResetAllStock}
            loading={loading}
          />
        )}
        {currentPage === 'admin' && showChangePassword && (
          <ChangePasswordPage
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
