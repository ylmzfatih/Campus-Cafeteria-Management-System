const express = require('express');
const router = express.Router();
const kullaniciController = require('../controllers/kullaniciController');

module.exports = function(pool) {
  const controller = kullaniciController(pool);

  // Kullanıcı işlemleri
  router.post('/giris', controller.giris);
  router.post('/kayit', controller.kayit);
  router.get('/me', controller.me);
  router.post('/sifre-guncelle', controller.sifreGuncelle);
  
  // Kart işlemleri
  router.get('/kartKontrol', controller.kartKontrol);
  router.post('/kayip-kart', controller.kayipKart);
  
  // Bakiye işlemleri
  router.post('/bakiye-yukle', controller.bakiyeYukle);
  router.get('/bakiye-sorgula', controller.bakiyeSorgula);
  router.get('/mevcut-bakiye', controller.mevcutBakiye);
  
  // İşlem geçmişi
  router.get('/islem-gecmisi', controller.islemGecmisi);

  return router;
};