import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu/:tableNumber" element={<Menu />} />
            <Route path="/cart/:tableNumber" element={<Cart />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
