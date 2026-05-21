import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Kontrol from './Kontrol';
import Profil from './Profil';
import Bakiye from './Bakiye';
import HesapHareketleri from './HesapHareketleri';
import KartKayboldu from './KartKayboldu';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    switch (location.pathname) {
      case '/login':
        document.title = 'KampüsKantin - Giriş Yap';
        break;
      case '/register':
        document.title = 'KampüsKantin - Kayıt Ol';
        break;
      case '/kontrol':
        document.title = 'KampüsKantin';
        break;  
      case '/':
        document.title = 'KampüsKantin - Ana Sayfa';
        break;
      default:
        document.title = 'KampüsKantin';
    }
  }, [location]);

  return (
    <div>
      {isHome && (
  <div className="home-container">
    <img src="kampuskantin.png" alt="KampüsKantin Logo" className="kampus-image" />
    <h1>KampüsKantin Otomasyonuna Hoşgeldiniz</h1>
    <div className="button-group">
      <Link to="/login" className="btn">Giriş Yap</Link>
      <Link to="/register" className="btn">Kayıt Ol</Link>
    </div>
  </div>
)}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/kontrol" element={<Kontrol />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/bakiye" element={<Bakiye />} />
        <Route path="/hesaphareketleri" element={<HesapHareketleri/>} />
        <Route path="/kartkayboldu" element={<KartKayboldu/>} />
      </Routes>
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
