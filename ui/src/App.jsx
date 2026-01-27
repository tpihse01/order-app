import { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import OrderPage from './pages/OrderPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [orders, setOrders] = useState([])
  const [nextOrderId, setNextOrderId] = useState(1)

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const addOrder = (cartItems, totalAmount) => {
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
          ? { ...order, status: newStatus }
          : order
      )
    )
  }

  return (
    <div className="app">
      <NavigationBar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="app-content">
        {currentPage === 'order' && <OrderPage onOrder={addOrder} />}
        {currentPage === 'admin' && (
          <AdminPage 
            orders={orders} 
            onUpdateOrderStatus={updateOrderStatus}
          />
        )}
      </main>
    </div>
  )
}

export default App
