import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnaSayfa = () => {
  const navigation = useNavigation();

  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('ogrenciNo');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Giriş' as never }], // typescript linter hatasını önlemek için
    });
  };
  

  return (
    <View style={styles.container}>
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.jpg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Menü Butonları */}
      <View style={styles.menuButtons}>
        <TouchableOpacity style={styles.button} onPress={() => handleNavigate('Profil')}>
          <Text style={styles.buttonText}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleNavigate('Bakiye')}>
          <Text style={styles.buttonText}>Bakiye Yükleme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleNavigate('HesapHareketleri')}>
          <Text style={styles.buttonText}>Hesap Hareketleri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleNavigate('KartKayboldu')}>
          <Text style={styles.buttonText}>Kartım Kayboldu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AnaSayfa;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 280,
    height: 280,
  },
  menuButtons: {
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
