import { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import OrderPage from './pages/OrderPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('order')

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="app">
      <NavigationBar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="app-content">
        {currentPage === 'order' && <OrderPage />}
        {currentPage === 'admin' && <AdminPage />}
      </main>
    </div>
  )
}

export default App
