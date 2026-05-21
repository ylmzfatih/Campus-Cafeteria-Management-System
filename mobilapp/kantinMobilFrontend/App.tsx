// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import GirisScreen from './screens/GirisScreen';
import KayitOlScreen from './screens/KayitOlScreen';
import AnaSayfaScreen from './screens/AnaSayfaScreen';
import ProfilScreen from './screens/ProfilScreen';
import BakiyeScreen from './screens/BakiyeScreen';
import AciklamaScreen from './screens/AciklamaScreen'; // ✅ Yeni ekranı ekledik
import KartKaybolduScreen from './screens/KartKaybolduScreen';

export type RootStackParamList = {
  AnaSayfa: undefined;
  Giriş: undefined;
  Kayıt: undefined;
  Home: undefined;
  Profil: undefined;
  Bakiye: undefined;
  HesapHareketleri: undefined; // ✅ Açıklama ekranı eklendi
  KartKayboldu: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>KampüsKantin Otomasyonuna Hoşgeldiniz</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Giriş')}
        >
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Kayıt')}
        >
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Giriş" component={GirisScreen} />
        <Stack.Screen name="Kayıt" component={KayitOlScreen} />
        <Stack.Screen name="AnaSayfa" component={AnaSayfaScreen} />
        <Stack.Screen name="Profil" component={ProfilScreen} />
        <Stack.Screen name="Bakiye" component={BakiyeScreen} />
        <Stack.Screen name="HesapHareketleri" component={AciklamaScreen} />
        <Stack.Screen name="KartKayboldu" component={KartKaybolduScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
