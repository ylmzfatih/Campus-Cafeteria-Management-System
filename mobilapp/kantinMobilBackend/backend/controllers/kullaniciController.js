const sql = require('mssql/msnodesqlv8');

module.exports = function(pool) {
  return {
    kayit: async (req, res) => {
      const { KartId, OgrenciNo, Ad, Soyad, Sifre } = req.body;

      if (!KartId) {
        return res.status(400).json({ message: 'Kart ID gereklidir!' });
      }

      try {
        const kartKontrol = await pool.request()
          .input('KartId', sql.VarChar(50), KartId)
          .query('SELECT * FROM Kartlar WHERE KartId = @KartId');

        if (kartKontrol.recordset.length === 0) {
          return res.status(400).json({ message: 'Geçersiz kart!' });
        }

        const kart = kartKontrol.recordset[0];
        if (kart.IsAssigned) {
          return res.status(400).json({ message: 'Bu kart zaten kayıtlı!' });
        }

        await pool.request()
          .input('KartId', sql.VarChar(50), KartId)
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Ad', sql.VarChar(50), Ad)
          .input('Soyad', sql.VarChar(50), Soyad)
          .input('Sifre', sql.VarChar(50), Sifre)
          .query('INSERT INTO Kullanicilar (KartId, OgrenciNo, Ad, Soyad, Sifre) VALUES (@KartId, @OgrenciNo, @Ad, @Soyad, @Sifre)');

        await pool.request()
          .input('KartId', sql.VarChar(50), KartId)
          .query('UPDATE Kartlar SET IsAssigned = 1 WHERE KartId = @KartId');

        res.status(200).json({ message: 'Kayıt başarıyla tamamlandı!' });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası!', error: err.message });
      }
    },

    giris: async (req, res) => {
      const { OgrenciNo, Sifre } = req.body;

      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Sifre', sql.VarChar(50), Sifre)
          .query('SELECT * FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo AND Sifre = @Sifre');

        if (result.recordset.length === 0) {
          return res.status(401).json({ success: false, message: 'Öğrenci numarası veya şifre hatalı!' });
        }

        res.json({ success: true, message: 'Giriş başarılı!' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
      }
    },

    sifreGuncelle: async (req, res) => {
      console.log("Şifre güncelleme isteği alındı", req.body);
      const { OgrenciNo, mevcutSifre, yeniSifre } = req.body;

      if (!OgrenciNo || !mevcutSifre || !yeniSifre) {
        return res.status(400).json({ message: 'Öğrenci numarası, mevcut şifre ve yeni şifre gereklidir!' });
      }

      try {
        // Kullanıcıyı mevcut şifre ile doğrula
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Sifre', sql.VarChar(50), mevcutSifre)
          .query('SELECT * FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo AND Sifre = @Sifre');

        if (result.recordset.length === 0) {
          return res.status(401).json({ message: 'Mevcut şifre hatalı!' });
        }

        // Yeni şifreyi güncelle
        await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('YeniSifre', sql.VarChar(50), yeniSifre)
          .query('UPDATE Kullanicilar SET Sifre = @YeniSifre WHERE OgrenciNo = @OgrenciNo');

        res.status(200).json({ message: 'Şifre başarıyla güncellendi!' });
      } catch (err) {
        console.error("Hata:", err);  
        res.status(500).json({ message: 'Sunucu hatası!', error: err.message, stack: err.stack });
      }
    },
    
    kartKontrol: async (req, res) => {
      const { kartId } = req.query;
      console.log('Kart kontrolü isteği alındı:', kartId);

      try {
        const result = await pool.request()
          .input('KartId', sql.VarChar(50), kartId)
          .query('SELECT * FROM Kartlar WHERE KartId = @KartId');

        console.log('Kart sorgusu sonucu:', result.recordset);

        if (result.recordset.length === 0) {
          console.log('Kart bulunamadı:', kartId);
          return res.json({ gecerli: false, message: 'Kart sistemde kayıtlı değil!' });
        }

        const kart = result.recordset[0];
        console.log('Kart durumu:', {
          kartId: kart.KartId,
          isAssigned: kart.IsAssigned,
          isFrozen: kart.IsFrozen
        });

        if (kart.IsAssigned) {
          console.log('Kart zaten kullanımda:', kartId);
          return res.json({ gecerli: false, message: 'Bu kart zaten kullanılmış!' });
        }

        if (kart.IsFrozen) {
          console.log('Kart dondurulmuş:', kartId);
          return res.json({ gecerli: false, message: 'Bu kart dondurulmuş durumda!' });
        }

        console.log('Kart kullanılabilir:', kartId);
        res.json({ gecerli: true, message: 'Kart kullanılabilir.' });

      } catch (err) {
        console.error('Kart kontrolü hatası:', err);
        res.status(500).json({ gecerli: false, message: 'Sunucu hatası.', error: err.message });
      }
    },

    me: async (req, res) => {
      const { ogrenciNo } = req.query;
    
      if (!ogrenciNo) {
        return res.status(400).json({ message: 'Öğrenci numarası gereklidir.' });
      }
    
      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), ogrenciNo)
          .query('SELECT KartId, Ad, Soyad, OgrenciNo, Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');
    
        if (result.recordset.length === 0) {
          return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
    
        res.status(200).json(result.recordset[0]);
      } catch (err) {
        console.error('Sunucu hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
      }
    },

    // YENİ DÜZENLENMİŞ BAKİYE FONKSİYONLARI
    bakiyeYukle: async (req, res) => {
      const { OgrenciNo, YuklenecekTutar } = req.body;
      console.log("Gelen veri:", req.body);
    
      if (!OgrenciNo || !YuklenecekTutar) {
        return res.status(400).json({
          success: false,
          message: 'Öğrenci numarası ve yüklemek istediğiniz tutar gereklidir!'
        });
      }
    
      if (isNaN(YuklenecekTutar) || YuklenecekTutar <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz tutar!'
        });
      }
    
      try {
        // 1. Mevcut bakiyeyi al
        const mevcutBakiye = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .query('SELECT Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');

        if (mevcutBakiye.recordset.length === 0) {
          console.log('Kullanıcı bulunamadı!');
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı!'
          });
        }

        const yeniBakiye = Number(mevcutBakiye.recordset[0].Bakiye) + Number(YuklenecekTutar);

        // 2. Bakiye güncelle
        await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('YeniBakiye', sql.Decimal(10, 2), yeniBakiye)
          .query('UPDATE Kullanicilar SET Bakiye = @YeniBakiye WHERE OgrenciNo = @OgrenciNo');
    
        // 3. Hesap hareketleri kaydı ekle
        const insertResult = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('islemTuru', sql.VarChar(100), 'Bakiye Yükleme')
          .input('tutar', sql.Decimal(10, 2), YuklenecekTutar)
          .input('bakiye', sql.Decimal(10, 2), yeniBakiye)
          .query(`
            INSERT INTO HesapHareketleri (ogrenciNo, islemTarihi, islemTuru, tutar, bakiye)
            VALUES (@OgrenciNo, GETDATE(), @islemTuru, @tutar, @bakiye)
          `);
        if (insertResult.rowsAffected[0] > 0) {
          console.log('HesapHareketleri kaydı eklendi:', {
            ogrenciNo: OgrenciNo,
            islemTarihi: new Date(),
            islemTuru: 'Bakiye Yükleme',
            tutar: YuklenecekTutar,
            bakiye: yeniBakiye
          });
        } else {
          console.error('HesapHareketleri kaydı EKLENEMEDİ!');
        }
    
        res.status(200).json({
          success: true,
          message: 'Bakiye yüklendi',
          yeniBakiye: yeniBakiye
        });
    
      } catch (err) {
        console.error("Sunucu hatası:", err);
        res.status(500).json({
          success: false,
          message: 'Sunucu hatası',
          error: err.message
        });
      }
    },
    

    bakiyeSorgula: async (req, res) => {
      const { OgrenciNo } = req.query;
    
      if (!OgrenciNo) {
        return res.status(400).json({ 
          success: false,
          message: 'Öğrenci numarası gereklidir' 
        });
      }
    
      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .query('SELECT Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');
    
        if (result.recordset.length === 0) {
          return res.status(404).json({ 
            success: false,
            message: 'Kullanıcı bulunamadı' 
          });
        }
    
        res.status(200).json({
          success: true,
          bakiye: result.recordset[0].Bakiye
        });
      } catch (err) {
        console.error('Bakiye sorgulama hatası:', err);
        res.status(500).json({ 
          success: false,
          message: 'Sunucu hatası' 
        });
      }
    },

    mevcutBakiye: async (req, res) => {
      const { OgrenciNo } = req.query; // DİKKAT: req.query kullanıyoruz (GET isteği)
      
      if (!OgrenciNo) {
        return res.status(400).json({ message: 'Öğrenci numarası gereklidir!' });
      }
    
      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .query('SELECT Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');
    
        res.status(200).json({ 
          success: true,
          bakiye: result.recordset[0].Bakiye // "Bakiye" kolon adı veritabanıyla aynı mı?
        });
      } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası!' });
      }
    },

    islemGecmisi: async (req, res) => {
      try {
        const { ogrenciNo, limit } = req.query;
        
        if (!ogrenciNo) {
          return res.status(400).json({ 
            success: false, 
            message: 'Öğrenci numarası gereklidir' 
          });
        }

        console.log('İşlem geçmişi sorgulanıyor:', ogrenciNo);

        let queryStr = `
          SELECT 
            islemTarihi,
            islemTuru,
            tutar,
            bakiye
          FROM HesapHareketleri 
          WHERE ogrenciNo = @OgrenciNo 
          ORDER BY islemTarihi DESC
        `;
        if (limit) {
          queryStr = `
            SELECT TOP (@limit)
              islemTarihi,
              islemTuru,
              tutar,
              bakiye
            FROM HesapHareketleri 
            WHERE ogrenciNo = @OgrenciNo 
            ORDER BY islemTarihi DESC
          `;
        }

        const request = pool.request()
          .input('OgrenciNo', sql.VarChar(20), ogrenciNo);
        if (limit) request.input('limit', sql.Int, parseInt(limit));

        const result = await request.query(queryStr);

        console.log('Sorgu sonucu kayıt sayısı:', result.recordset.length);
        console.log('İlk kayıt örneği:', result.recordset[0]);

        if (result.recordset.length === 0) {
          console.log('Veri bulunamadı');
          return res.status(200).json({
            success: true,
            data: [],
            message: 'İşlem geçmişi bulunamadı'
          });
        }

        // Veriyi dönüştür
        const formattedData = result.recordset.map(item => ({
          ...item,
          islemTarihi: item.islemTarihi,
          tutar: Number(item.tutar),
          bakiye: Number(item.bakiye)
        }));

        console.log('Formatlanmış veri örneği:', formattedData[0]);

        res.status(200).json({
          success: true,
          data: formattedData,
          message: 'İşlem geçmişi başarıyla getirildi'
        });

      } catch (err) {
        console.error("İşlem geçmişi hatası:", err);
        console.error("Hata detayı:", err.message);
        console.error("Stack trace:", err.stack);
        res.status(500).json({ 
          success: false, 
          message: 'İşlem geçmişi alınamadı',
          error: err.message 
        });
      }
    },

    kayipKart: async (req, res) => {
      const { ogrenciNo, sifre, yeniKartId, adim } = req.body;
      try {
        console.log('Kayıp kart isteği:', { ogrenciNo, sifre, yeniKartId, adim });
        
        // Kullanıcıyı al
        const userResult = await pool.request()
          .input('OgrenciNo', sql.VarChar(50), ogrenciNo ? ogrenciNo.trim() : '')
          .query(`SELECT * FROM Kullanicilar WHERE RTRIM(LTRIM(OgrenciNo)) = RTRIM(LTRIM(@OgrenciNo))`);
        
        if (userResult.recordset.length === 0) {
          console.log('Kullanıcı bulunamadı:', ogrenciNo);
          return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const user = userResult.recordset[0];
        
        // Şifre kontrolü
        if (user.Sifre !== sifre) {
          console.log('Şifre hatalı:', { gelen: sifre, db: user.Sifre });
          return res.status(401).json({ message: 'Şifre hatalı' });
        }

        // 1. Adım: Kartı dondurma
        if (adim === 'dondur') {
          const freezeResult = await pool.request()
            .input('KartId', sql.VarChar(50), user.KartId.trim())
            .query(`UPDATE Kartlar SET IsFrozen = 1 WHERE LOWER(RTRIM(LTRIM(KartID))) = LOWER(RTRIM(LTRIM(@KartId)))`);
          
          console.log('Kart donduruldu:', user.KartId, freezeResult.rowsAffected);
          return res.status(200).json({ message: 'Kart başarıyla donduruldu.' });
        }

        // 2. Adım: Yeni kart atama
        if (adim === 'degistir') {
          if (!yeniKartId) {
            return res.status(400).json({ message: 'Yeni kart ID gereklidir' });
          }

          // Yeni kartın geçerliliğini kontrol et
          const kartResult = await pool.request()
            .input('KartId', sql.VarChar(50), yeniKartId.trim())
            .query(`SELECT IsAssigned, IsFrozen FROM Kartlar WHERE RTRIM(LTRIM(KartID)) = RTRIM(LTRIM(@KartId))`);

          if (kartResult.recordset.length === 0) {
            console.log('Yeni kart ID geçersiz:', yeniKartId);
            return res.status(400).json({ message: 'Yeni kart ID geçersiz' });
          }

          const yeniKart = kartResult.recordset[0];
          if (yeniKart.IsAssigned) {
            console.log('Yeni kart başka kullanıcıya ait:', yeniKartId);
            return res.status(400).json({ message: 'Yeni kart başka bir kullanıcıya ait' });
          }

          if (yeniKart.IsFrozen) {
            console.log('Yeni kart dondurulmuş:', yeniKartId);
            return res.status(400).json({ message: 'Yeni kart dondurulmuş durumda' });
          }

          // Eski kartı güncelle
          await pool.request()
            .input('KartId', sql.VarChar(50), user.KartId.trim())
            .query(`UPDATE Kartlar SET IsAssigned = 1, IsFrozen = 1 WHERE LOWER(RTRIM(LTRIM(KartID))) = LOWER(RTRIM(LTRIM(@KartId)))`);

          // Yeni kartı kullanıcıya ata
          await pool.request()
            .input('KartId', sql.VarChar(50), yeniKartId.trim())
            .query(`UPDATE Kartlar SET IsAssigned = 1, IsFrozen = 0 WHERE RTRIM(LTRIM(KartID)) = RTRIM(LTRIM(@KartId))`);

          // Kullanıcıya yeni kartId'yi ata
          await pool.request()
            .input('YeniKartId', sql.VarChar(50), yeniKartId.trim())
            .input('OgrenciNo', sql.VarChar(50), ogrenciNo.trim())
            .query(`UPDATE Kullanicilar SET KartId = @YeniKartId WHERE OgrenciNo = @OgrenciNo`);

          console.log('Yeni kart atandı:', yeniKartId, 'Kullanıcı:', ogrenciNo);
          return res.status(200).json({ message: 'Yeni kart başarıyla atandı.' });
        }

        // Adım yanlışsa
        console.log('Geçersiz işlem adımı:', adim);
        return res.status(400).json({ message: 'Geçersiz işlem adımı' });
      } catch (error) {
        console.error('Kayıp kart işlemi hatası:', error);
        return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
      }
    },

    

    
  };
};