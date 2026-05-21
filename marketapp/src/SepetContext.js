import React, { createContext, useContext, useState } from 'react';

const SepetContext = createContext();

export const SepetProvider = ({ children }) => {
  const [sepet, setSepet] = useState([]);

  const sepeteEkle = (urun) => {
    setSepet((prev) => {
      const mevcut = prev.find((u) => u.urunKodu === urun.urunKodu);
      if (mevcut) {
        return prev.map((u) =>
          u.urunKodu === urun.urunKodu ? { ...u, adet: u.adet + 1 } : u
        );
      }
      return [...prev, { ...urun, adet: 1 }];
    });
  };

  const urunAzalt = (urunKodu) => {
    setSepet((prev) =>
      prev
        .map((u) =>
          u.urunKodu === urunKodu ? { ...u, adet: u.adet - 1 } : u
        )
        .filter((u) => u.adet > 0)
    );
  };

  const urunSil = (urunKodu) => {
    setSepet((prev) => prev.filter((u) => u.urunKodu !== urunKodu));
  };

  const sepetiTemizle = () => setSepet([]);

  const toplamFiyat = sepet.reduce((toplam, urun) => toplam + urun.fiyat * urun.adet, 0);

  return (
    <SepetContext.Provider value={{ sepet, sepeteEkle, urunAzalt, urunSil, toplamFiyat, sepetiTemizle }}>
      {children}
    </SepetContext.Provider>
  );
};

export const useSepet = () => useContext(SepetContext);
