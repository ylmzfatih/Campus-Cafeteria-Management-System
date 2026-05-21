import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.223.56:3005/api/kullanici';

const KartKaybolduScreen = ({ navigation }: any) => {
  const [sifre, setSifre] = useState('');
  const [yeniKartId, setYeniKartId] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [kartDonduruldu, setKartDonduruldu] = useState(false);

  const handleKartDondur = async () => {
    try {
      const ogrenciNo = await AsyncStorage.getItem('ogrenciNo');
      console.log('Kart dondur istek:', { ogrenciNo, sifre });
      const response = await axios.post(`${API_BASE}/kayip-kart`, {
        ogrenciNo,
        sifre,
        yeniKartId,
        adim: 'dondur'
      });
      setMesaj(response.data.message);
      setHata('');
      setKartDonduruldu(true);
    } catch (error: any) {
      console.log('Kart dondur hata:', error, error?.response?.data);
      setMesaj('');
      setHata(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handleKartDegistir = async () => {
    try {
      const ogrenciNo = await AsyncStorage.getItem('ogrenciNo');
      console.log('Kart değiştir istek:', { ogrenciNo, sifre, yeniKartId });
      const response = await axios.post(`${API_BASE}/kayip-kart`, {
        ogrenciNo,
        sifre,
        yeniKartId,
        adim: 'degistir'
      });
      setMesaj(response.data.message);
      setHata('');
      setTimeout(() => {
        AsyncStorage.removeItem('ogrenciNo');
        AsyncStorage.removeItem('token');
        navigation.replace('Giriş');
      }, 2000);
    } catch (error: any) {
      console.log('Kart değiştir hata:', error, error?.response?.data);
      setMesaj('');
      setHata(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kartım Kayboldu</Text>
      <Text style={styles.info}>Önce mevcut kartınızı dondurun, ardından yeni kartınızı tanımlayın.</Text>
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={sifre}
        onChangeText={setSifre}
      />
      {!kartDonduruldu ? (
        <TouchableOpacity style={styles.button} onPress={handleKartDondur}>
          <Text style={styles.buttonText}>Kartı Dondur</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Yeni Kart ID"
            value={yeniKartId}
            onChangeText={setYeniKartId}
          />
          <TouchableOpacity style={styles.button} onPress={handleKartDegistir}>
            <Text style={styles.buttonText}>Yeni Kartı Tanımla</Text>
          </TouchableOpacity>
        </>
      )}
      {mesaj ? <Text style={styles.success}>{mesaj}</Text> : null}
      {hata ? <Text style={styles.error}>{hata}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  info: { fontSize: 16, color: '#555', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#3498db', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  success: { color: 'green', textAlign: 'center', marginTop: 10 },
  error: { color: 'red', textAlign: 'center', marginTop: 10 },
});

export default KartKaybolduScreen;