import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Kontrol.css';
import './Bakiye.css';

const Bakiye = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [ogrenciNo, setOgrenciNo] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stateOgrenciNo = location.state?.ogrenciNo;
    const storedOgrenciNo = localStorage.getItem("ogrenciNo");
    const finalOgrenciNo = stateOgrenciNo || storedOgrenciNo;

    if (!finalOgrenciNo) {
      console.warn("Öğrenci numarası bulunamadı!");
    }

    setOgrenciNo(finalOgrenciNo);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage('Lütfen 0\'dan büyük geçerli bir bakiye girin.');
      setAmount('');
      setCardNumber('');
      setCvv('');
      setExpiryDate('');
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiryDate)) {
      setMessage('Son kullanım tarihi formatı geçersiz. (AA/YY)');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ogrenciNo: ogrenciNo,
          yeniBakiye: parsedAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Bakiye yüklenemedi.');
        return;
      }

      setCardNumber('');
      setCvv('');
      setExpiryDate('');
      setAmount('');
      setMessage('Bakiye başarıyla yüklendi!');
    } catch (err) {
      console.error(err);
      setMessage('Sunucuya bağlanılamadı.');
    }
  };

  const handleProfile = () => navigate('/profil', { state: { ogrenciNo } });
  const handleBakiyeYukleme = () => navigate('/bakiye', { state: { ogrenciNo } });
  const handleHesapHareketleri = () => navigate('/hesaphareketleri', { state: { ogrenciNo } });
  const handleKartKayboldu = () => navigate('/kartkayboldu', { state: { ogrenciNo } });
  const handleLogout = () => {
    localStorage.removeItem("ogrenciNo");
    navigate('/');
  };

  return (
    <div className="kontrol-container" style={{ display: 'flex', flexDirection: 'row' }}>
      
      <div className="bakiye-container" style={{ flex: 2, padding: '2rem 3rem' }}>
        <h2>Bakiye Yükleme</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Kart Numarası"
            value={cardNumber}
            maxLength="16"
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
            required
          />
          <input
            type="text"
            placeholder="CVV"
            value={cvv}
            maxLength="3"
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
            required
          />
          <input
            type="text"
            placeholder="Son Kullanım Tarihi (AA/YY)"
            value={expiryDate}
            maxLength="5"
            onChange={(e) => {
              let value = e.target.value.replace(/[^\d]/g, '');
              if (value.length >= 3) {
                value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
              }
              setExpiryDate(value);
            }}
            required
          />
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Yüklenecek Bakiye (₺)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button type="submit">Bakiye Yükle</button>
        </form>
        {message && <p>{message}</p>}
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
};

export default Bakiye;
