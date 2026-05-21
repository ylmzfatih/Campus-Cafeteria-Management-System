import React from 'react';
import './Kontrol.css';
import { useNavigate } from 'react-router-dom';

const Kontrol = () => {
  const navigate = useNavigate();
  const ogrenciNo = localStorage.getItem('ogrenciNo');

  const handleLogout = () => {
    localStorage.removeItem('ogrenciNo');
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profil', { state: { ogrenciNo } });
  };

  const handleBakiyeYukleme = () => {
    navigate('/bakiye', { state: { ogrenciNo } });
  };

  const handleHesapHareketleri = () => {
    navigate('/hesaphareketleri', { state: { ogrenciNo } });
  };
  const handleKartKayboldu = () => {
    navigate('/kartkayboldu', { state: { ogrenciNo } });
  };

  return (
    <div className="kontrol-container">
      <div className="kontrol-image">
        <img src="kampuskantin.png" alt="Kampüs Kantini" className="kampuskantin" />
      </div>

      <div className="kontrol-menu">
        <h2>Menü</h2>
        <ul>
          <li>
            <button onClick={handleProfile}>Profil</button>
          </li>
          <li>
            <button onClick={handleBakiyeYukleme}>Bakiye Yükleme</button>
          </li>
          <li>
            <button onClick={handleHesapHareketleri}>Hesap Hareketleri</button>
          </li>
          <li>
            <button onClick={handleKartKayboldu}>Kartım Kayboldu</button>
          </li>
          <li>
            <button onClick={handleLogout}>Çıkış Yap</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Kontrol;
