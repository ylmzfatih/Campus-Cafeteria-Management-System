const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');
const kullaniciRoutes = require('./routes/kullaniciRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const config={
  server: 'ALPEREN-MSI\\alpcu',
  dataase: 'KantinDB',
  options:{
    encrypt: true,
    trustServerCertificate: true
  },
  connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=ALPEREN-MSI\\SQLEXPRESS;Database=KantinDB;Trusted_Connection=Yes;",
  driver: "msnodesqlv8"
};


let sonOkunanKartId = null;

app.get('/api/kullanici/kartGeldi', (req, res) => {
  let { kartId } = req.query;
  console.log('Kart ID Alındı:', kartId);

  if (!kartId) {
    return res.status(400).json({ success: false, message: 'Kart ID gereklidir' });
  }

  if (typeof kartId === 'object') {
    console.log("Kart ID, bir nesne:", kartId);
    kartId = kartId.toString();
  }

  sonOkunanKartId = kartId;
  console.log('Kart okundu:', kartId);

  res.json({ success: true, kartId });
});

app.get('/api/getKartId', (req, res) => {
  if (!sonOkunanKartId) {
    return res.status(404).json({ message: 'Henüz kart okutulmadı.' });
  }
  res.status(200).json({
    success: true,
    kartId: sonOkunanKartId
  });
});





sql.connect(config)
  .then(pool => {
    console.log('✅ Veritabanı bağlantısı başarılı.');

    const router = kullaniciRoutes(pool); // pool ile fonksiyon olarak çağır
    app.use('/api/kullanici', kullaniciRoutes(pool));

  })
  .catch(err => {
    console.error('❌ Veritabanı bağlantısı başarısız:', err);
    process.exit(1);
  });

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://192.168.223.56:${PORT}`);

});
