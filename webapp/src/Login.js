import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [ogrenciNo, setOgrenciNo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır!');
      setPassword('');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ogrenciNo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Bir hata oluştu.');

        if (data.resetPassword) {
          setPassword('');
        }

        return;
      }

      setErrorMessage('');
      localStorage.setItem("ogrenciNo", data.user.ogrenciNo);

      navigate('/kontrol');

    } catch (err) {
      console.error('Giriş hatası:', err);
      setErrorMessage('Sunucuya bağlanılamadı.');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h2 className="login-title">Giriş Yap</h2>
        <div className="login-box">
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Öğrenci No" 
              value={ogrenciNo}
              maxLength={20}
              onChange={(e) => setOgrenciNo(e.target.value)} 
              required
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <button type="submit">Giriş Yap</button>
          </form>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <p>Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
