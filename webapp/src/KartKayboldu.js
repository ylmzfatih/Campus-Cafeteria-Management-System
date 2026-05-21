import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HesapHareketleri.css';

function KartKayboldu() {
  const navigate = useNavigate();

  const [sifre, setSifre] = useState('');
  const [yeniKartId, setYeniKartId] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [kartDonduruldu, setKartDonduruldu] = useState(false);

  const ogrenciNo = localStorage.getItem('ogrenciNo');

  const handleKartDondur = async () => {
    try {
      const response = await axios.post('http://localhost:3001/kayip-kart', {
        ogrenciNo,
        sifre,
        adim: 'dondur'
      });

      setMesaj(response.data.message);
      setHata('');
      setKartDonduruldu(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setHata(error.response.data.message);
      } else {
        setHata('Bir hata oluştu');
      }
      setMesaj('');
    }
  };

  const handleKartDegistir = async () => {
    try {
      const response = await axios.post('http://localhost:3001/kayip-kart', {
        ogrenciNo,
        sifre,
        yeniKartId,
        adim: 'degistir'
      });

      setMesaj(response.data.message);
      setHata('');

      setTimeout(() => {
        localStorage.removeItem('ogrenciNo');
        localStorage.removeItem('token');
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      if (error.response && error.response.data) {
        setHata(error.response.data.message);
      } else {
        setHata('Bir hata oluştu');
      }
      setMesaj('');
    }
  };

  const handleProfile = () => navigate('/profil');
  const handleBakiyeYukleme = () => navigate('/bakiye');
  const handleHesapHareketleri = () => navigate('/hesaphareketleri');
  const handleKartKayboldu = () => navigate('/kartkayboldu');
  const handleLogout = () => {
    localStorage.removeItem('ogrenciNo');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="kontrol-container" style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{
        flex: 2,
        padding: '2rem 3rem',
        marginTop: '30px',
        backgroundColor: '#f4f4f4',
        color: '#2c3e50'
      }}>
        <h2>Kart Kayboldu</h2>
        <p>
          Önce mevcut kartınızı dondurun, ardından yeni kartınızı tanımlayın.
        </p>

        <div style={{ marginTop: '1rem' }}>
          <label>Şifre:</label><br />
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />

          {!kartDonduruldu ? (
            <button onClick={handleKartDondur} style={{ padding: '10px 20px', marginBottom: '10px' }}>
              Kartı Dondur
            </button>
          ) : (
            <>
              <label>Yeni Kart ID:</label><br />
              <input
                type="text"
                value={yeniKartId}
                onChange={(e) => setYeniKartId(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />

              <button onClick={handleKartDegistir} style={{ padding: '10px 20px' }}>
                Yeni Kartı Tanımla
              </button>
            </>
          )}

          {mesaj && <p style={{ color: 'green', marginTop: '10px' }}>{mesaj}</p>}
          {hata && <p style={{ color: 'red', marginTop: '10px' }}>{hata}</p>}
        </div>
      </div>

      <div className="kontrol-menu">
        <h2>Menü</h2>
        <ul>
          <li><button onClick={handleProfile}>Profil</button></li>
          <li><button onClick={handleBakiyeYukleme}>Bakiye Yükleme</button></li>
          <li><button onClick={handleHesapHareketleri}>Hesap Hareketleri</button></li>
          <li><button onClick={handleKartKayboldu}>Kartım Kayboldu</button></li>
          <li><button onClick={handleLogout}>Çıkış Yap</button></li>
        </ul>
      </div>
    </div>
  );
}

export default KartKayboldu;
