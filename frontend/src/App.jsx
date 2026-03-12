import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import './styles/index.css';
import './styles/landing.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/menu.css';
import './styles/cart.css';

const publicPaths = ['/', '/login', '/register'];

function AppContent() {
  const location = useLocation();
  const isPublic = publicPaths.includes(location.pathname);
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  if (isSuperAdmin) {
    return (
      <Routes>
        <Route path="/superadmin" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      {isPublic ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : isDashboard ? (
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/menu/:tableNumber" element={<Menu />} />
          <Route path="/cart/:tableNumber" element={<Cart />} />
          <Route path="/history/:tableNumber" element={<OrderHistory />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
