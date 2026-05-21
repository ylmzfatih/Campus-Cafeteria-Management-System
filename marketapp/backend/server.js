const express = require('express');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3003;

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

// -------- Ürün Listesi --------
app.get('/urunler', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await new sql.Request().query('SELECT * FROM Urunler');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Ürünler alınamadı:', err);
    res.status(500).json({ message: 'Ürünleri çekerken hata oluştu' });
  }
});

// -------- Kart Okuma --------
let bekleyenKartId = null;

// Arduino -> Sunucuya kart gönderiyor (JSON POST)
app.post('/api/kart-okuma', (req, res) => {
  const kartId = req.body.kartId;
  if (!kartId) {
    return res.status(400).json({ success: false, message: 'Kart ID eksik' });
  }
  bekleyenKartId = kartId;
  console.log('Yeni kart okundu:', kartId);
  res.json({ success: true });
});

// React -> Kart ID'si varsa alıyor
app.get('/api/kart-okuma', (req, res) => {
  if (bekleyenKartId) {
    const kartId = bekleyenKartId;
    bekleyenKartId = null;
    res.json({ kartId });
  } else {
    res.json({ kartId: null });
  }
});

// -------- Sepet Onayı --------
app.post('/api/kullanici/kartGeldi', async (req, res) => {
  const kartId = req.body.kartId;
  const sepetTutari = req.body.sepetTutari;
  const urunler = req.body.urunler || [];

  if (!kartId || !sepetTutari || urunler.length === 0) {
    return res.status(400).json({ success: false, message: 'Eksik veri: kartId, sepetTutari veya urunler.' });
  }

  try {
    await sql.connect(config);

    // Kart ID'den öğrenci numarası ve bakiye alınır
    const result = await new sql.Request()
      .input('kartId', sql.NVarChar, kartId)
      .query('SELECT ogrenciNo, bakiye FROM Kullanicilar WHERE kartId = @kartId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    const { ogrenciNo, bakiye } = result.recordset[0];

    if (bakiye < sepetTutari) {
      return res.status(400).json({ success: false, message: 'Bakiye yetersiz.' });
    }

    const yeniBakiye = bakiye - sepetTutari;

    // Yeni bakiye ogrenciNo üzerinden güncellenir
    await new sql.Request()
      .input('ogrenciNo', sql.NVarChar, ogrenciNo)
      .input('sepetTutari', sql.Decimal(10, 2), sepetTutari)
      .query('UPDATE Kullanicilar SET bakiye = bakiye - @sepetTutari WHERE ogrenciNo = @ogrenciNo');

    // Ürün isimlerini topluca çek
    const urunKodlari = urunler.map(u => `'${u.urunKodu}'`).join(',');
    const urunQuery = `SELECT urunKodu, urunAdi FROM Urunler WHERE urunKodu IN (${urunKodlari})`;
    const urunResult = await new sql.Request().query(urunQuery);
    const urunMap = {};
    urunResult.recordset.forEach(u => { urunMap[u.urunKodu] = u.urunAdi; });

    const urunIsimleri = urunler.map(urun => {
      const ad = urunMap[urun.urunKodu] || 'Bilinmeyen Ürün';
      return `${ad} (${urun.adet} adet)`;
    });

    const islemDetayi = `Alışveriş: ${urunIsimleri.join(', ')}`;

    const hareketResult = await new sql.Request()
      .input('ogrenciNo', sql.NVarChar, ogrenciNo)
      .input('islemTuru', sql.NVarChar, islemDetayi)
      .input('tutar', sql.Decimal(10, 2), -sepetTutari)
      .input('bakiye', sql.Decimal(10, 2), yeniBakiye)
      .query(`
        INSERT INTO HesapHareketleri (ogrenciNo, islemTuru, tutar, bakiye, islemTarihi)
        OUTPUT INSERTED.id
        VALUES (@ogrenciNo, @islemTuru, @tutar, @bakiye, GETDATE())
      `);

    const hareketId = hareketResult.recordset[0].id;

    // Satın alınan ürünleri kaydet
    for (const urun of urunler) {
      await new sql.Request()
        .input('hareketId', sql.Int, hareketId)
        .input('urunKodu', sql.NVarChar, urun.urunKodu)
        .input('adet', sql.Int, urun.adet)
        .query(`
          INSERT INTO SatinAlinanUrunler (hareketId, urunKodu, adet)
          VALUES (@hareketId, @urunKodu, @adet)
        `);
    }

    res.json({ success: true, message: 'Satın alma başarılı.', kalanBakiye: yeniBakiye });
  } catch (err) {
    console.error('Sepet onay hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});


app.listen(port, '192.168.223.56', () => {
  console.log(`✅ Sunucu çalışıyor: http://192.168.223.56:${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Beklenmeyen hata:', err);
});

