import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.223.56:3005/api/kullanici';

const FILTERS = [
  { label: 'Son 10 İşlem', value: 'last10' },
  { label: 'Son 1 Hafta', value: 'week' },
  { label: 'Son 1 Ay', value: 'month' },
  { label: 'Tarih Aralığı', value: 'range' },
];

const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
function formatDate(y: string, m: string, d: string) {
  if (!y || !m || !d) return '';
  return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const AciklamaScreen = () => {
  const [hareketler, setHareketler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('last10');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startYear, setStartYear] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startDay, setStartDay] = useState('');
  const [endYear, setEndYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDay, setEndDay] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detayText, setDetayText] = useState({ urun: '', fiyat: '' });

  const startDate = formatDate(startYear, startMonth, startDay);
  const endDate = formatDate(endYear, endMonth, endDay);

  const fetchHareketler = async () => {
    try {
      setError(null);
      setLoading(true);
      const no = await AsyncStorage.getItem('ogrenciNo');
      if (!no) {
        setError('Öğrenci numarası alınamadı');
        return;
      }
      let url = `${API_BASE}/islem-gecmisi?ogrenciNo=${no}`;
      if (filter === 'last10') url += '&limit=10';
      else if (filter === 'week') url += '&period=week';
      else if (filter === 'month') url += '&period=month';
      else if (filter === 'range' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await axios.get(url);
      if (response.data.success) {
        setHareketler(response.data.data || []);
      } else {
        setError(response.data.message || 'Veri alınamadı');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Hareketler alınamadı');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHareketler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, startDate, endDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHareketler();
  };
  
  const handleDetay = (item: any) => {
    if (item.islemTuru && item.islemTuru !== 'Bakiye Yükleme') {
      setDetayText({
        urun: `${item.islemTuru}`,
        fiyat: `Tutar: -₺${Math.abs(Number(item.tutar)).toFixed(2)}`
      });
      setModalVisible(true);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isBakiyeYukleme = item.islemTuru === 'Bakiye Yükleme';
    const tutar = Math.abs(Number(item.tutar)).toFixed(2);
    return (
      <View style={styles.item}>
        <Text style={styles.text}>
          Tarih: {item.islemTarihi.replace('T', ' ').slice(0, 16)}
        </Text>
        <Text style={styles.text}>İşlem: {item.islemTuru.startsWith('Alışveriş') ? 'Alışveriş' : item.islemTuru}</Text>
        <Text style={[styles.text, { color: isBakiyeYukleme ? 'green' : 'red', fontWeight: 'bold' }]}> 
          {isBakiyeYukleme ? '+' : '-'}₺{tutar}
        </Text>
        <Text style={styles.text}>Kalan Bakiye: ₺{Number(item.bakiye).toFixed(2)}</Text>
        {item.islemTuru !== 'Bakiye Yükleme' && (
          <TouchableOpacity style={styles.detayButton} onPress={() => handleDetay(item)}>
            <Text style={styles.detayButtonText}>İşlem Detayı</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Filtrelenmiş hareketler (web ile aynı mantık)
  const birGunMs = 24 * 60 * 60 * 1000;
  const simdi = new Date();
  // Ekranda gösterilecek saat mantığına göre tarih döndüren fonksiyon
  const getDisplayDate = (item: any) => new Date(item.islemTarihi.replace(' ', 'T'));

  const filtrelenmisHareketler = hareketler
    .filter(item => {
      const islemTarihi = new Date(item.islemTarihi.replace(' ', 'T'));
      if (filter === 'week') {
        return (simdi.getTime() - islemTarihi.getTime()) <= 7 * birGunMs;
      } else if (filter === 'month') {
        return (simdi.getTime() - islemTarihi.getTime()) <= 30 * birGunMs;
      } else if (filter === 'range') {
        if (!startDate || !endDate) return false;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return islemTarihi >= start && islemTarihi <= end;
      }
      return true; // last10
    })
    .sort((a, b) => getDisplayDate(b).getTime() - getDisplayDate(a).getTime())
    .slice(0, filter === 'last10' ? 10 : undefined);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>İşlem Geçmişi</Text>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>İşlem Filtresi:</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterButtonText}>
            {FILTERS.find(f => f.value === filter)?.label || 'Filtre Seç'}
          </Text>
        </TouchableOpacity>
        {filter === 'range' && (
          <View style={{ flexDirection: 'column', marginLeft: 10 }}>
            <Text style={styles.dateLabel}>Başlangıç Tarihi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY"
                value={startYear}
                onChangeText={setStartYear}
                keyboardType="numeric"
                maxLength={4}
              />
              <TextInput
                style={styles.dateInput}
                placeholder="AA"
                value={startMonth}
                onChangeText={setStartMonth}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={styles.dateInput}
                placeholder="GG"
                value={startDay}
                onChangeText={setStartDay}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <Text style={styles.dateLabel}>Bitiş Tarihi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY"
                value={endYear}
                onChangeText={setEndYear}
                keyboardType="numeric"
                maxLength={4}
              />
              <TextInput
                style={styles.dateInput}
                placeholder="AA"
                value={endMonth}
                onChangeText={setEndMonth}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={styles.dateInput}
                placeholder="GG"
                value={endDay}
                onChangeText={setEndDay}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>
        )}
      </View>
      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalContent}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.value}
                style={styles.modalItem}
                onPress={() => {
                  setFilter(f.value);
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <FlatList
        data={filtrelenmisHareketler}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz işlem yapılmamış</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
          />
        }
      />
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>İşlem Detayı</Text>
            <Text style={styles.modalDetayText}>{detayText.urun}</Text>
            <Text style={styles.modalFiyatText}>{detayText.fiyat}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  filterLabel: { fontSize: 16, marginRight: 8 },
  filterButton: { backgroundColor: '#3498db', padding: 8, borderRadius: 8 },
  filterButtonText: { color: '#fff', fontWeight: 'bold' },
  dateLabel: { fontSize: 14, color: '#3498db', marginTop: 4, marginBottom: 2 },
  dateInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 6, marginHorizontal: 2, minWidth: 50, color: '#333', textAlign: 'center' },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, minWidth: 200 },
  modalItem: { paddingVertical: 10 },
  modalItemText: { fontSize: 16, color: '#3498db', textAlign: 'center' },
  detayButton: { backgroundColor: '#3498db', borderRadius: 8, padding: 8, marginTop: 8, alignItems: 'center' },
  detayButtonText: { color: '#fff', fontWeight: 'bold' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalDetayText: { fontSize: 16, marginBottom: 20, color: '#333', textAlign: 'center' },
  modalFiyatText: { fontSize: 16, marginBottom: 20, color: 'red', textAlign: 'center', fontWeight: 'bold' },
  modalButton: { backgroundColor: '#3498db', borderRadius: 8, padding: 10, marginTop: 10 },
  modalButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default AciklamaScreen;
