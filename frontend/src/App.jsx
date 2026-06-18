import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage'
import CustomersPage from './pages/CustomersPage'
import OrdersPage from './pages/OrdersPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <h2>📦 Inventory MS</h2>
          <NavLink to="/" end>Products</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
