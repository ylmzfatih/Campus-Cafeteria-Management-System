import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HesapHareketleri.css';
import axios from 'axios';

function HesapHareketleri() {
  const navigate = useNavigate();
  const ogrenciNo = localStorage.getItem("ogrenciNo");
  const [hareketler, setHareketler] = useState([]);
  const [acikDetaylar, setAcikDetaylar] = useState([]);
  const [filtre, setFiltre] = useState("son10");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchHareketler = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/hesap-hareketleri?ogrenciNo=${ogrenciNo}`);
        setHareketler(response.data);
      } catch (error) {
        console.error("Hesap hareketleri alınamadı:", error);
      }
    };

    if (ogrenciNo) {
      fetchHareketler();
    }
  }, [ogrenciNo]);

  const handleToggleDetay = (index) => {
    if (acikDetaylar.includes(index)) {
      setAcikDetaylar(acikDetaylar.filter(i => i !== index));
    } else {
      setAcikDetaylar([...acikDetaylar, index]);
    }
  };

  const handleProfile = () => navigate('/profil');
  const handleBakiyeYukleme = () => navigate('/bakiye');
  const handleHesapHareketleri = () => navigate('/hesaphareketleri');
  const handleKartKayboldu = () => navigate('/kartkayboldu');
  const handleLogout = () => {
    localStorage.removeItem("ogrenciNo");
    localStorage.removeItem("token");
    navigate('/');
  };

  // Filtrelenmiş hareketler
  const filtrelenmisHareketler = hareketler
    .filter(item => {
      const birGunMs = 24 * 60 * 60 * 1000;
      const simdi = new Date();
      const islemTarihi = new Date(item.Tarih);

      if (filtre === "hafta") {
        return (simdi - islemTarihi) <= 7 * birGunMs;
      } else if (filtre === "ay") {
        return (simdi - islemTarihi) <= 30 * birGunMs;
      } else if (filtre === "tarih") {
        if (!startDate || !endDate) return false;
        const start = new Date(startDate);
        const end = new Date(endDate);
        // End'in saatini gün sonunda bitirmek için:
        end.setHours(23, 59, 59, 999);
        return islemTarihi >= start && islemTarihi <= end;
      }
      return true; // son10
    })
    .sort((a, b) => new Date(b.Tarih) - new Date(a.Tarih))
    .slice(0, filtre === "son10" ? 10 : undefined);

  return (
    <div className="kontrol-container" style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{
        flex: 2,
        padding: '2rem 3rem',
        marginTop: '30px',
        backgroundColor: '#f4f4f4',
        color: '#2c3e50'
      }}>
        <h3 style={{
          marginBottom: '2rem',
          fontSize: '2rem',
          borderBottom: '2px solid #ccc',
          paddingBottom: '0.5rem'
        }}>
          📋 Hesap Hareketleri
        </h3>

        {/* Filtre ve tarih alanı */}
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <label htmlFor="filtre" style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginRight: '10px'
            }}>
              İşlem Filtresi:
            </label>
            <select
              id="filtre"
              value={filtre}
              onChange={(e) => setFiltre(e.target.value)}
              style={{
                fontSize: '1.05rem',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                color: '#2c3e50',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3498db')}
              onBlur={(e) => (e.target.style.borderColor = '#ccc')}
            >
              <option value="son10">Son 10 İşlem</option>
              <option value="hafta">Son 1 Hafta</option>
              <option value="ay">Son 1 Ay</option>
              <option value="tarih">Tarih Aralığı</option>
            </select>
          </div>

          {filtre === "tarih" && (
            <>
              <div>
                <label>Başlangıç Tarihi: </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
              <div>
                <label>Bitiş Tarihi: </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Hareket tablosu */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {filtrelenmisHareketler.length === 0 ? (
            <p style={{ padding: '1rem' }}>Hiç işlem bulunamadı.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Tarih</th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>İşlem Türü</th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Tutar</th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Kalan Bakiye</th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisHareketler.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td style={{ padding: '10px' }}>
                        {item.Tarih.replace('T', ' ').slice(0, 16)}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {item.IslemTuru.split(':')[0]}
                      </td>
                      <td style={{ padding: '10px', color: item.Tutar >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                        {item.Tutar >= 0 ? `+₺${item.Tutar.toFixed(2)}` : `-₺${Math.abs(item.Tutar).toFixed(2)}`}
                      </td>
                      <td style={{ padding: '10px' }}>
                        ₺{item.KalanBakiye.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {item.IslemTuru.startsWith('Alışveriş') && (
                          <button onClick={() => handleToggleDetay(index)} style={{
                            backgroundColor: '#34495e',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}>
                            {acikDetaylar.includes(index) ? 'Detayı Gizle' : 'Detayı Göster'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {acikDetaylar.includes(index) && item.IslemTuru.startsWith('Alışveriş') && (
                      <tr>
                        <td colSpan="5" style={{
                          backgroundColor: '#f9f9f9',
                          padding: '1rem',
                          borderTop: '1px solid #ddd'
                        }}>
                          <strong></strong> {item.IslemTuru}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
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

export default HesapHareketleri;
