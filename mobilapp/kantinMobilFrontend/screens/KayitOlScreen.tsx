// screens/KayitOlScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';

const API_URL = "http://192.168.223.56:3005/api/kullanici/kayit";


const KayitOlScreen = () => {
  const [kartID, setKartID] = useState('');
  const [ogrenciNo, setOgrenciNo] = useState('');
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');

  const API_BASE = "http://192.168.223.56:3005/api/kullanici";

const handleKayit = async () => {
  if (sifre !== sifreTekrar) {
    Alert.alert('Hata', 'Şifreler eşleşmiyor!');
    return;
  }

  // Şifre uzunluk kontrolü
  if (sifre.length < 6) {
    Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır!');
    setSifre('');
    setSifreTekrar('');
    return;
  }

  try {
    // ✅ Kart kontrolü doğru URL ile
    const kontrolResponse = await axios.get(`${API_BASE}/kartKontrol?kartId=${kartID}`);
    const { gecerli, message } = kontrolResponse.data;

    if (!gecerli) {
      Alert.alert('Hata', message);
      if (message.includes('dondurulmuş')) {
        setKartID('');
      }
      return;
    }

    // ✅ Kayıt isteği de doğru URL ile
    const kayitResponse = await axios.post(`${API_BASE}/kayit`, {
      KartId: kartID,
      OgrenciNo: ogrenciNo,
      Ad: ad,
      Soyad: soyad,
      Sifre: sifre,
    });

    Alert.alert('Başarılı', kayitResponse.data.message);

    // Formu temizle
    setKartID('');
    setOgrenciNo('');
    setAd('');
    setSoyad('');
    setSifre('');
    setSifreTekrar('');
  } catch (error) {
    console.error(error);
    Alert.alert('Hata', 'Kayıt işlemi sırasında bir hata oluştu.');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        placeholder="Kart ID"
        value={kartID}
        onChangeText={setKartID}
        style={styles.input}
      />

      <TextInput
        placeholder="Öğrenci Numarası"
        value={ogrenciNo}
        onChangeText={setOgrenciNo}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Ad"
        value={ad}
        onChangeText={setAd}
        style={styles.input}
      />

      <TextInput
        placeholder="Soyad"
        value={soyad}
        onChangeText={setSoyad}
        style={styles.input}
      />

      <TextInput
        placeholder="Şifre"
        value={sifre}
        onChangeText={setSifre}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Şifre Tekrarı"
        value={sifreTekrar}
        onChangeText={setSifreTekrar}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleKayit}>
        <Text style={styles.buttonText}>Kaydol</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default KayitOlScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f7f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#2e86de',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
