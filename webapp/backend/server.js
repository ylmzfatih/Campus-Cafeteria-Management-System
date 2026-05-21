const express = require('express');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const config = {
  server: 'ALPEREN-MSI\\alpcu',
  database: 'KantinDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=ALPEREN-MSI\\SQLEXPRESS;Database=KantinDB;Trusted_Connection=Yes;",
  driver: "msnodesqlv8"
};


app.post('/kayip-kart', async (req, res) => {
  const { ogrenciNo, sifre, yeniKartId, adim } = req.body;

  try {
    await sql.connect(config);

    const userRequest = new sql.Request();
    userRequest.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());
    const userResult = await userRequest.query(`
      SELECT * FROM Kullanicilar 
      WHERE RTRIM(LTRIM(OgrenciNo)) = RTRIM(LTRIM(@OgrenciNo))
    `);
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    const user = userResult.recordset[0];
    if (user.Sifre !== sifre) {
      return res.status(401).json({ message: 'Şifre hatalı' });
    }

    if (adim === "dondur") {
      const freezeRequest = new sql.Request();
      freezeRequest.input('KartId', sql.VarChar(50), user.KartId.trim());

      const freezeResult = await freezeRequest.query(`
        UPDATE Kartlar 
        SET IsFrozen = 1 
        WHERE LOWER(RTRIM(LTRIM(KartID))) = LOWER(RTRIM(LTRIM(@KartId)))
      `);
      console.log("Kart donduruldu. Güncellenen satır:", freezeResult.rowsAffected);
      return res.status(200).json({ message: 'Kart başarıyla donduruldu.' });
    }

    if (adim === "degistir") {
      const kartRequest = new sql.Request();
      kartRequest.input('KartId', sql.VarChar(50), yeniKartId.trim());
      const kartResult = await kartRequest.query(`
        SELECT IsAssigned FROM Kartlar WHERE RTRIM(LTRIM(KartID)) = RTRIM(LTRIM(@KartId))
      `);
      if (kartResult.recordset.length === 0) {
        return res.status(400).json({ message: 'Yeni kart ID geçersiz' });
      }
      if (kartResult.recordset[0].IsAssigned === true) {
        return res.status(400).json({ message: 'Yeni kart başka bir kullanıcıya ait' });
      }
      const eskiKartRequest = new sql.Request();
      eskiKartRequest.input('KartId', sql.VarChar(50), user.KartId.trim());
      const eskiGuncelle = await eskiKartRequest.query(`
        UPDATE Kartlar 
        SET IsAssigned = 1, IsFrozen = 1 
        WHERE LOWER(RTRIM(LTRIM(KartID))) = LOWER(RTRIM(LTRIM(@KartId)))
      `);
      console.log("Eski kart güncellendi:", eskiGuncelle.rowsAffected);

      const yeniKartRequest = new sql.Request();
      yeniKartRequest.input('KartId', sql.VarChar(50), yeniKartId.trim());
      await yeniKartRequest.query(`
        UPDATE Kartlar SET IsAssigned = 1, IsFrozen = 0 WHERE RTRIM(LTRIM(KartID)) = RTRIM(LTRIM(@KartId))
      `);
      const updateUserRequest = new sql.Request();
      updateUserRequest
        .input('YeniKartId', sql.VarChar(50), yeniKartId.trim())
        .input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());
      await updateUserRequest.query(`
        UPDATE Kullanicilar 
        SET KartId = @YeniKartId 
        WHERE OgrenciNo = @OgrenciNo
      `);
      return res.status(200).json({ message: 'Yeni kart başarıyla atandı, bilgiler korundu.' });
    }
    // Adım yanlışsa
    res.status(400).json({ message: 'Geçersiz işlem adımı' });
  } catch (err) {
    console.error('Kart işlemi hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});




// Kayıt
app.post('/register', async (req, res) => {
  const { kartId, ogrenciNo, firstName, lastName, password } = req.body;

  console.log('Gelen req.body:', req.body);

  if (!ogrenciNo || typeof ogrenciNo !== 'string') {
    return res.status(400).json({ message: 'Geçersiz Öğrenci Numarası' });
  }
  try {
    await sql.connect(config);

    const kartRequest = new sql.Request();
    kartRequest.input('KartId', sql.VarChar(50), kartId.trim());

    const kartResult = await kartRequest.query(
      'SELECT IsAssigned FROM Kartlar WHERE RTRIM(LTRIM(KartID)) = RTRIM(LTRIM(@KartId))'
    );
    if (kartResult.recordset.length === 0) {
      return res.status(400).json({ message: 'Geçersiz kart ID' });
    }
    if (kartResult.recordset[0].IsAssigned === true) {
      return res.status(400).json({ message: 'Bu kart zaten bir kullanıcıya ait' });
    }
    const userRequest = new sql.Request();
    await userRequest
      .input('KartId', sql.VarChar(50), kartId.trim())
      .input('OgrenciNo', sql.VarChar(20), ogrenciNo.trim())
      .input('Ad', sql.VarChar(50), firstName.trim())
      .input('Soyad', sql.VarChar(50), lastName.trim())
      .input('Sifre', sql.VarChar(50), password)
      .query(
        'INSERT INTO Kullanicilar (KartId, OgrenciNo, Ad, Soyad, Sifre) VALUES (@KartId, @OgrenciNo, @Ad, @Soyad, @Sifre)'
      );
    const updateRequest = new sql.Request();
    await updateRequest
      .input('KartId', sql.VarChar(50), kartId.trim())
      .query('UPDATE Kartlar SET IsAssigned = 1 WHERE RTRIM(LTRIM(KartID)) = RTRIM(LTRIM(@KartId))');

    res.status(200).json({ message: 'Kayıt başarılı' });
  } catch (err) {
    console.error('Hata:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});



// Giriş
app.post('/login', async (req, res) => {
  const { ogrenciNo, password } = req.body;

  try {
    await sql.connect(config);
    const request = new sql.Request();
    request.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());

    const ogrenciResult = await request.query(`
      SELECT * FROM Kullanicilar 
      WHERE RTRIM(LTRIM(OgrenciNo)) = RTRIM(LTRIM(@OgrenciNo))
    `);
    if (ogrenciResult.recordset.length === 0) {
      return res.status(401).json({ message: 'Öğrenci numarası hatalı', resetPassword: true });
    }
    const user = ogrenciResult.recordset[0];
    if (user.Sifre !== password) {
      return res.status(401).json({ message: 'Şifre hatalı', resetPassword: true });
    }
    res.status(200).json({
      message: 'Giriş başarılı',
      user: {
        id: user.Id,
        ad: user.Ad,
        soyad: user.Soyad,
        ogrenciNo: user.OgrenciNo,
        kartId: user.KartId,
      }
    });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Profil bilgisi çekme (ogrenciNo ile)
app.get('/profil', async (req, res) => {
  const ogrenciNo = req.query.ogrenciNo;
  try {
    await sql.connect(config);

    const request = new sql.Request();
    request.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());

    const result = await request.query(`
      SELECT KartId, OgrenciNo, Ad, Soyad, Bakiye, KayitTarihi 
      FROM Kullanicilar 
      WHERE OgrenciNo = @OgrenciNo
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Profil hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Bakiye güncelleme (ogrenciNo ile)
app.post('/update-balance', async (req, res) => {
  const { ogrenciNo, yeniBakiye } = req.body;
  try {
    await sql.connect(config);
    const getRequest = new sql.Request();
    getRequest.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());
    const result = await getRequest.query(`
      SELECT Bakiye FROM Kullanicilar 
      WHERE OgrenciNo = @OgrenciNo
    `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    const mevcutBakiye = parseFloat(result.recordset[0].Bakiye || 0);
    const eklenecekBakiye = parseFloat(yeniBakiye);
    const toplamBakiye = mevcutBakiye + eklenecekBakiye;
    const updateRequest = new sql.Request();
    updateRequest.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());
    updateRequest.input('ToplamBakiye', sql.Decimal(10, 2), toplamBakiye);

    await updateRequest.query(`
      UPDATE Kullanicilar 
      SET Bakiye = @ToplamBakiye 
      WHERE OgrenciNo = @OgrenciNo
    `);
    const hareketRequest = new sql.Request();
    hareketRequest.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());
    hareketRequest.input('IslemTuru', sql.VarChar(50), 'Bakiye Yükleme');
    hareketRequest.input('Tutar', sql.Decimal(10, 2), eklenecekBakiye);
    hareketRequest.input('KalanBakiye', sql.Decimal(10, 2), toplamBakiye);
    await hareketRequest.query(`
      INSERT INTO HesapHareketleri (ogrenciNo, islemTuru, tutar, bakiye, islemTarihi)
      VALUES (@OgrenciNo, @IslemTuru, @Tutar, @KalanBakiye, GETDATE())
    `);
    res.status(200).json({ 
      message: 'Bakiye başarıyla eklendi ve hesap hareketine kaydedildi.',
      toplamBakiye: toplamBakiye.toFixed(2)
    });
  } catch (err) {
    console.error('Bakiye güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});


// Hesap hareketleri
app.get('/hesap-hareketleri', async (req, res) => {
  const { ogrenciNo } = req.query;

  try {
    await sql.connect(config);

    const request = new sql.Request();
    request.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());

    const result = await request.query(`
      SELECT 
        islemTarihi AS Tarih, 
        islemTuru AS IslemTuru, 
        tutar AS Tutar, 
        bakiye AS KalanBakiye
      FROM HesapHareketleri 
      WHERE ogrenciNo = @OgrenciNo 
      ORDER BY islemTarihi DESC
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Hesap hareketleri hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre güncelleme
app.post('/update-password', async (req, res) => {
  const { ogrenciNo, currentPassword, newPassword } = req.body;

  try {
    await sql.connect(config);
    const checkRequest = new sql.Request();
    checkRequest.input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim());
    const userResult = await checkRequest.query(`
      SELECT Sifre FROM Kullanicilar 
      WHERE RTRIM(LTRIM(OgrenciNo)) = RTRIM(LTRIM(@OgrenciNo))
    `);
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    if (userResult.recordset[0].Sifre !== currentPassword) {
      return res.status(401).json({ message: 'Mevcut şifre hatalı' });
    }
    const updateRequest = new sql.Request();
    updateRequest
      .input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim())
      .input('YeniSifre', sql.VarChar(50), newPassword);
    await updateRequest.query(`
      UPDATE Kullanicilar 
      SET Sifre = @YeniSifre 
      WHERE RTRIM(LTRIM(OgrenciNo)) = RTRIM(LTRIM(@OgrenciNo))
    `);
    res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });

  } catch (err) {
    console.error('Şifre güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.listen(port, () => {
  console.log(`Server çalışıyor: http://localhost:${port}`);
});
