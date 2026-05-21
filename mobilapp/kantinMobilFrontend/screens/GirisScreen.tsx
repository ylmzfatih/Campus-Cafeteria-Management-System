import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const API_URL = 'http://192.168.223.56:3005/api/kullanici/giris'; // IP adresini gerektiğinde güncelle




const GirisScreen = () => {
  const [ogrenciNo, setOgrenciNo] = useState('');
  const [sifre, setSifre] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const API_BASE = "http://192.168.223.56:3005/api/kullanici";

  const handleLogin = async () => {
    if (!ogrenciNo || !sifre) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }
  
    try {
      // Giriş API'sini çağırıyoruz
      const response = await axios.post(`${API_BASE}/giris`, {
        OgrenciNo: ogrenciNo,
        Sifre: sifre,
      });
  
      // API yanıtını alıyoruz
      const { success, message } = response.data;
  
      // Eğer giriş başarılıysa
      if (success) {
        await AsyncStorage.setItem('ogrenciNo', ogrenciNo); // Öğrenci numarasını AsyncStorage'e kaydediyoruz
        Alert.alert('Başarılı', message || 'Giriş başarılı!'); // Başarılı giriş mesajı
        navigation.navigate('AnaSayfa'); // Ana sayfaya yönlendiriyoruz
      } else {
        // Giriş başarısızsa
        Alert.alert('Hata', message || 'Giriş başarısız!');
      }
    } catch (error: any) {
      console.error('Giriş Hatası:', error);
  
      // Sunucuya bağlanılamıyorsa hata mesajı
      const hataMesaji =
        error.response?.data?.message || error.message || 'Sunucuya bağlanılamadı!';
      Alert.alert('Hata', hataMesaji); // Hata mesajını gösteriyoruz
    }
  };
  

  


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      <View style={styles.card}>
        <TextInput
          placeholder="Öğrenci Numarası"
          value={ogrenciNo}
          onChangeText={setOgrenciNo}
          style={styles.input}
        />
        <TextInput
          placeholder="Şifre"
          value={sifre}
          onChangeText={setSifre}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
        <Text style={styles.altText}>
          Hesabınız yok mu?{' '}
          <Text style={styles.linkText} onPress={() => navigation.navigate('Kayıt')}>
            Kayıt Ol
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default GirisScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    elevation: 5,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3498db',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  altText: {
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});
export interface Kullanici {
    kartId: string;
    ad: string;
    soyad: string;
    ogrenciNo: string;
    kayitTarihi: string;
    bakiye: number;
}
