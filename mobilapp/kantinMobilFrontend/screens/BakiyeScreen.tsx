import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = "http://192.168.223.56:3005/api/kullanici";

const BakiyeScreen = () => {
  const [yuklenecekTutar, setYuklenecekTutar] = useState<string>('');
  const [ogrenciNo, setOgrenciNo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Yeni eklenen alanlar
  const [kartNumarasi, setKartNumarasi] = useState<string>('');
  const [sonKullanmaAy, setSonKullanmaAy] = useState<string>('');
  const [sonKullanmaYil, setSonKullanmaYil] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const no = await AsyncStorage.getItem('ogrenciNo');
        if (no) {
          setOgrenciNo(no);
        }
      } catch (error) {
        Alert.alert('Hata', 'Öğrenci numarası alınamadı');
      }
    };
    init();
  }, []);

  const handleBakiyeYukle = async () => {
    if (!ogrenciNo || !yuklenecekTutar) {
      Alert.alert('Hata', 'Öğrenci numarası ve tutar gereklidir');
      return;
    }

    // Kart numarası kontrolü
    if (kartNumarasi.length !== 16) {
      Alert.alert('Hata', 'Kart numarası 16 haneli olmalıdır');
      return;
    }

    // Son kullanım ay ve yıl kontrolü
    if (sonKullanmaAy.length !== 2 || sonKullanmaYil.length !== 2) {
      Alert.alert('Hata', 'Son kullanım tarihi ay ve yıl 2 haneli olmalıdır');
      return;
    }

    // CVV kontrolü
    if (cvv.length !== 3) {
      Alert.alert('Hata', 'CVV 3 haneli olmalıdır');
      return;
    }

    const tutar = parseFloat(yuklenecekTutar);
    if (isNaN(tutar) || tutar <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar giriniz');
      return;
    }



    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/bakiye-yukle`, {
        OgrenciNo: ogrenciNo,
        YuklenecekTutar: tutar,
        // Backend bu bilgileri beklemiyor diye göndermiyorum, sadece ön yüz kontrolü yapıldı
      });

      Alert.alert('Başarılı', 'Bakiye yüklendi');
      setYuklenecekTutar('');
      setKartNumarasi('');
      setSonKullanmaAy('');
      setSonKullanmaYil('');
      setCvv('');
    } 
    
    finally {
      Alert.alert('Başarılı', 'Bakiye yüklendi');
      setLoading(false);
    }
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bakiye Yükle</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Kart Numarası (16 Hane)"
          keyboardType="numeric"
          maxLength={16}
          value={kartNumarasi}
          onChangeText={setKartNumarasi}
          placeholderTextColor="#999"
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="AA"
            keyboardType="numeric"
            maxLength={2}
            value={sonKullanmaAy}
            onChangeText={setSonKullanmaAy}
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="YY"
            keyboardType="numeric"
            maxLength={2}
            value={sonKullanmaYil}
            onChangeText={setSonKullanmaYil}
            placeholderTextColor="#999"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="CVV (3 Hane)"
          keyboardType="numeric"
          maxLength={3}
          value={cvv}
          onChangeText={setCvv}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Yüklenecek Tutar (₺)"
          keyboardType="numeric"
          value={yuklenecekTutar}
          onChangeText={setYuklenecekTutar}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleBakiyeYukle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>YÜKLE</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BakiyeScreen;
function setHareketler(data: any) {
  throw new Error('Function not implemented.');
}

