/**
 * 메인 앱 컴포넌트
 * 
 * 전역 상태 관리, 라우팅, API 호출을 담당하는 최상위 컴포넌트입니다.
 * 
 * 주요 기능:
 * - 페이지 라우팅 (Welcome, Order, Admin, ChangePassword)
 * - 메뉴 및 주문 데이터 관리
 * - 재고 실시간 동기화 (폴링)
 * - 관리자 인증
 * 
 * @component
 */
import { useState, useEffect, useCallback } from 'react'
import NavigationBar from './components/NavigationBar'
import WelcomePage from './pages/WelcomePage'
import OrderPage from './pages/OrderPage'
import AdminPage from './pages/AdminPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import PasswordModal from './components/PasswordModal'
import Notification from './components/Notification'
import { menuAPI, orderAPI, authAPI, settingsAPI } from './api'
import { logger } from './utils/logger'
import { getErrorMessage } from './utils/errorHandler'
import { updateStockAndMenus, decreaseStockBatch, resetAllStockToZero } from './utils/stockHelpers'
import { validateOrder, validateNumber, validateString } from './utils/validators'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome')
  const [orders, setOrders] = useState([])
  const [menus, setMenus] = useState([])
  const [stock, setStock] = useState([])
  const [stockUpdateKey, setStockUpdateKey] = useState(0) // 재고 업데이트 강제 리렌더링용
  const [loading, setLoading] = useState(false)
  const [loadingMenus, setLoadingMenus] = useState(true) // 초기 로드 시 true로 시작
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [notification, setNotification] = useState(null)

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const loadMenus = useCallback(async () => {
    try {
      setLoadingMenus(true)
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
      logger.error('메뉴 로드 실패:', error)
      setNotification({ 
        message: getErrorMessage(error, '메뉴를 불러오는 중 오류가 발생했습니다.'), 
        type: 'error' 
      })
    } finally {
      setLoadingMenus(false)
    }
  }, [])

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const loadOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
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
      
      // 실제로 변경되었을 때만 상태 업데이트 (깜박임 방지)
      setOrders(prevOrders => {
        // 주문 개수가 다르면 변경된 것
        if (prevOrders.length !== formattedOrders.length) {
          return formattedOrders
        }
        
        // 주문이 없으면 비교할 필요 없음
        if (prevOrders.length === 0 && formattedOrders.length === 0) {
          return prevOrders
        }
        
        // 각 주문의 ID와 상태를 비교하여 변경사항 확인
        // 주문 ID 문자열로 빠른 비교
        const prevOrderIds = prevOrders.map(o => `${o.orderId}-${o.status}`).join(',')
        const newOrderIds = formattedOrders.map(o => `${o.orderId}-${o.status}`).join(',')
        
        // 변경사항이 없으면 이전 상태 유지 (리렌더링 방지)
        if (prevOrderIds === newOrderIds) {
          return prevOrders
        }
        
        return formattedOrders
      })
    } catch (error) {
      logger.error('주문 로드 실패:', error)
      // 폴링 중 에러는 조용히 처리 (사용자에게 알림 표시하지 않음)
      if (showLoading) {
        setNotification({ message: '주문 목록을 불러오는 중 오류가 발생했습니다.', type: 'error' })
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [])

  // 메뉴 및 재고 정보 로드
  useEffect(() => {
    loadMenus()
  }, [loadMenus])

  // 페이지 전환 시 데이터 로드
  useEffect(() => {
    if (currentPage === 'admin') {
      loadOrders(true) // 로딩 표시
      loadMenus() // 재고 정보도 함께 갱신
    }
    // 주문하기 화면으로 들어올 때마다 서버에서 최신 재고 반영
    // (관리자에서 재고 변경 시 OrderPage는 unmount 상태라서 state를 못 받음)
    if (currentPage === 'order') {
      loadMenus()
    }
  }, [currentPage, loadMenus, loadOrders])

  // 주문하기 화면이 활성화되어 있을 때 주기적으로 재고 정보 갱신 (다른 단말기에서 변경된 재고 반영)
  useEffect(() => {
    if (currentPage !== 'order') {
      return // 주문하기 화면이 아니면 폴링 중지
    }

    // 즉시 한 번 로드
    loadMenus()

    // 2초마다 재고 정보 갱신 (다른 단말기에서 변경된 재고를 실시간으로 반영)
    // 네트워크 부하를 줄이기 위해 1초에서 2초로 조정
    const intervalId = setInterval(() => {
      loadMenus()
    }, 2000) // 2초 간격

    // 컴포넌트 언마운트 또는 페이지 전환 시 인터벌 정리
    return () => {
      clearInterval(intervalId)
    }
  }, [currentPage, loadMenus])

  // 관리자 화면이 활성화되어 있을 때 주기적으로 주문 목록 갱신 (다른 단말기에서 생성된 주문 반영)
  useEffect(() => {
    if (currentPage !== 'admin') {
      return // 관리자 화면이 아니면 폴링 중지
    }

    // 즉시 한 번 로드 (로딩 표시)
    loadOrders(true)

    // 2초마다 주문 목록 갱신 (다른 단말기에서 생성된 주문을 실시간으로 반영)
    // showLoading=false로 설정하여 깜박임 방지
    const intervalId = setInterval(() => {
      loadOrders(false)
    }, 2000) // 2초 간격

    // 컴포넌트 언마운트 또는 페이지 전환 시 인터벌 정리
    return () => {
      clearInterval(intervalId)
    }
  }, [currentPage, loadOrders])

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
      // 비밀번호 검증
      const passwordValidation = validateString(password, '비밀번호', { minLength: 1, required: true });
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error);
        return;
      }

      await authAPI.adminLogin(password)
      setCurrentPage('admin')
      setShowPasswordModal(false)
      setPasswordError('')
      // 관리자 페이지 진입 시 주문 목록 로드
      loadOrders()
    } catch (error) {
      setPasswordError(getErrorMessage(error, '비밀번호를 다시 입력해 주십시오.'))
    }
  }

  const handlePasswordChange = async (oldPassword, newPassword) => {
    try {
      // 비밀번호 검증
      const oldPasswordValidation = validateString(oldPassword, '기존 비밀번호', { minLength: 1, required: true });
      if (!oldPasswordValidation.isValid) {
        throw new Error(oldPasswordValidation.error);
      }

      const newPasswordValidation = validateString(newPassword, '새 비밀번호', { minLength: 6, required: true });
      if (!newPasswordValidation.isValid) {
        throw new Error(newPasswordValidation.error);
      }

      if (oldPassword === newPassword) {
        throw new Error('새 비밀번호는 기존 비밀번호와 달라야 합니다.');
      }

      await settingsAPI.changeAdminPassword(oldPassword, newPassword)
      setNotification({ message: '비밀번호가 변경되었습니다.', type: 'success' })
      setShowChangePassword(false)
    } catch (error) {
      setNotification({ 
        message: getErrorMessage(error, '비밀번호 변경 중 오류가 발생했습니다.'), 
        type: 'error' 
      })
    }
  }

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const addOrder = useCallback(async (cartItems, totalAmount) => {
    try {
      // 입력값 검증
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error('장바구니가 비어있습니다.');
      }

      const totalAmountValidation = validateNumber(totalAmount, '총 금액', { min: 0, required: true });
      if (!totalAmountValidation.isValid) {
        throw new Error(totalAmountValidation.error);
      }

      // API 형식으로 변환
      const orderItems = cartItems.map(item => ({
        menu_id: item.productId,
        quantity: item.quantity,
        option_ids: item.selectedOptions.map(opt => opt.id),
        item_price: item.totalPrice
      }))

      // 주문 데이터 검증
      const orderData = {
        items: orderItems,
        total_amount: totalAmount
      };
      const orderValidation = validateOrder(orderData);
      if (!orderValidation.isValid) {
        throw new Error(orderValidation.error);
      }

      await orderAPI.createOrder(orderData)

      // 주문 성공 후 재고 정보 즉시 갱신 (실시간 반영)
      // 주문된 각 아이템의 재고를 차감
      const stockUpdates = {}
      cartItems.forEach(item => {
        stockUpdates[item.productId] = (stockUpdates[item.productId] || 0) + item.quantity
      })

      // stock과 menus 상태 일괄 업데이트
      decreaseStockBatch(setStock, setMenus, stockUpdates)
      
      // 관리자 화면이 열려 있으면 주문 목록 즉시 갱신 (새 주문 반영)
      // showLoading=false로 설정하여 깜박임 방지
      if (currentPage === 'admin') {
        loadOrders(false)
      }
      
      // 성공 반환 (알림은 OrderPage에서 표시)
      return { success: true }
    } catch (error) {
      // 에러는 OrderPage에서 처리하도록 throw
      throw error
    }
  }, [currentPage, loadOrders])

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      // 입력값 검증
      const orderIdValidation = validateNumber(orderId, '주문 ID', { min: 1, required: true });
      if (!orderIdValidation.isValid) {
        throw new Error(orderIdValidation.error);
      }

      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`유효하지 않은 주문 상태입니다: ${newStatus}`);
      }

      await orderAPI.updateOrderStatus(orderId, newStatus)
      // 주문 목록 갱신
      await loadOrders()
    } catch (error) {
      setNotification({ message: error.message || '주문 상태 변경 중 오류가 발생했습니다.', type: 'error' })
    }
  }, [loadOrders])

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const updateStock = useCallback(async (productId, change, stockValue) => {
    try {
      // 입력값 검증
      const productIdValidation = validateNumber(productId, '상품 ID', { min: 1, required: true });
      if (!productIdValidation.isValid) {
        throw new Error(productIdValidation.error);
      }

      if (stockValue !== undefined) {
        const stockValidation = validateNumber(stockValue, '재고', { min: 0, required: false });
        if (!stockValidation.isValid) {
          throw new Error(stockValidation.error);
        }
      } else if (change !== undefined) {
        const changeValidation = validateNumber(change, '재고 변경량', { required: true });
        if (!changeValidation.isValid) {
          throw new Error(changeValidation.error);
        }
      } else {
        throw new Error('재고 변경량(change) 또는 재고 값(stock)이 필요합니다.');
      }

      const result = await menuAPI.updateStock(productId, change, stockValue)
      
      // API 응답 검증
      if (!result || typeof result !== 'object') {
        throw new Error('서버 응답이 올바르지 않습니다.');
      }

      const newStock = result.stock;
      const stockValidation = validateNumber(newStock, '재고', { min: 0, required: true });
      if (!stockValidation.isValid) {
        logger.error('API 응답에 유효하지 않은 stock 값:', result);
        throw new Error('서버에서 받은 재고 값이 올바르지 않습니다.');
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
      logger.error('재고 업데이트 오류:', error)
      setNotification({ 
        message: getErrorMessage(error, '재고 수량 변경 중 오류가 발생했습니다.'), 
        type: 'error' 
      })
    }
  }, [])

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const resetAllStock = useCallback(async () => {
    // 확인은 AdminPage에서 React 컴포넌트로 처리
    // 여기서는 바로 실행하지 않고 확인 필요 플래그 반환
    return { needsConfirmation: true }
  }, [])

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const confirmResetAllStock = useCallback(async () => {
    try {
      await menuAPI.resetAllStock()
      // 모든 재고를 0으로 즉시 업데이트 (실시간 반영)
      resetAllStockToZero(setStock, setMenus)
      
      return { success: true }
    } catch (error) {
      throw error
    }
  }, [])

  // useCallback으로 함수 메모이제이션하여 불필요한 재생성 방지
  const resetAllOrders = useCallback(async () => {
    try {
      await orderAPI.deleteAllOrders()
      // 주문 목록 즉시 초기화
      setOrders([])
      
      return { success: true }
    } catch (error) {
      throw error
    }
  }, [])

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
        {currentPage === 'order' && <OrderPage onOrder={addOrder} stock={stock} menus={menus} stockUpdateKey={stockUpdateKey} loading={loadingMenus} />}
        {currentPage === 'admin' && !showChangePassword && (
          <AdminPage 
            orders={orders} 
            onUpdateOrderStatus={updateOrderStatus}
            stock={stock}
            onUpdateStock={updateStock}
            onResetAllStock={resetAllStock}
            onConfirmResetAllStock={confirmResetAllStock}
            onResetAllOrders={resetAllOrders}
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
      {/* 범용 알림 */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default App
