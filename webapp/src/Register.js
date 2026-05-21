import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({
    kartId: '',
    ogrenciNo: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    for (const key in form) {
      if (form[key].trim() === '') {
        alert('Lütfen tüm alanları doldurunuz!');
        return;
      }
    }

    if (form.password !== form.confirmPassword) {
      alert('Şifreler uyuşmuyor!');
      setForm((prevForm) => ({
        ...prevForm,
        password: '',
        confirmPassword: '',
      }));
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kartId: form.kartId,
          ogrenciNo: form.ogrenciNo,
          firstName: form.firstName,
          lastName: form.lastName,
          password: form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Kayıt başarısız.');

        if (
          data.message === 'Geçersiz kart ID' ||
          data.message === 'Bu kart zaten bir kullanıcıya ait'
        ) {
          setForm({
            kartId: '',
            ogrenciNo: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
          });
        }

        return;
      }

      alert('Kayıt başarılı! Giriş yap sayfasına yönlendiriliyorsunuz.');
      navigate('/login');
    } catch (error) {
      console.error('Kayıt sırasında hata:', error);
      alert('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
  };

  return (
    <div className="register-container">
      <h2>Kayıt Ol</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <div className="form-group">
          <input
            type="text"
            name="kartId"
            placeholder="Kart ID"
            value={form.kartId}
            onChange={handleChange}
            maxLength={8}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="ogrenciNo"
            placeholder="Öğrenci Numarası"
            value={form.ogrenciNo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="firstName"
            placeholder="Ad"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="lastName"
            placeholder="Soyad"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Şifre Tekrarı"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <button type="submit">Kaydol</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
