import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function LocationScreen({ onBack, onSelectLocation }) {
  const { theme: C } = useTheme();

  // Swaminarayan University, Kalol, Gujarat Coordinates
  const [coords, setCoords] = useState({
    latitude: 23.2389,
    longitude: 72.4988,
    accuracy: 4
  });
  const [address, setAddress] = useState('Central Library, Swaminarayan University, Ahmedabad-Mehsana Highway, Kalol');
  const [isWatching, setIsWatching] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState('Central University Library');
  const [searchQuery, setSearchQuery] = useState('');

  const campusLandmarks = [
    { name: 'Central University Library', category: 'Study & Notes Hub (North Wing)', lat: 23.2389, lng: 72.4988, icon: 'book-open' },
    { name: 'Tech Lab & Innovation Centre', category: 'Faculty of Engineering (Hackathons)', lat: 23.2401, lng: 72.5002, icon: 'zap' },
    { name: 'Main University Auditorium', category: 'Cultural Events & Ganesh Mahotsav', lat: 23.2375, lng: 72.4970, icon: 'award' },
    { name: 'Campus Food Court & Canteen', category: 'Marketplace Student Pickup Spot', lat: 23.2382, lng: 72.4995, icon: 'shopping-bag' },
    { name: 'Sports Ground & Gymnasium', category: 'Athletics & University Festival Grounds', lat: 23.2410, lng: 72.4960, icon: 'award' },
    { name: 'Ayurvedic & Pharmacy Research Block', category: 'Medical & Science Labs', lat: 23.2365, lng: 72.5010, icon: 'shield' }
  ];

  useEffect(() => {
    let timer;
    if (isWatching) {
      timer = setInterval(() => {
        setCoords((prev) => ({
          latitude: prev.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.0001,
          accuracy: Math.floor(Math.random() * 2) + 3
        }));
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isWatching]);

  const handleRecenter = () => {
    setCoords({ latitude: 23.2389, longitude: 72.4988, accuracy: 3 });
    Alert.alert('GPS Calibrated', 'Location set to Swaminarayan University, Kalol Campus.');
  };

  const handleSelectLandmark = (landmark) => {
    setSelectedSpot(landmark.name);
    setCoords({ latitude: landmark.lat, longitude: landmark.lng, accuracy: 3 });
    setAddress(`${landmark.name}, Swaminarayan University, Kalol`);
    if (onSelectLocation) {
      onSelectLocation({
        name: landmark.name,
        address: `${landmark.name}, Swaminarayan University, Kalol`,
        latitude: landmark.lat,
        longitude: landmark.lng
      });
    }
  };

  const filteredLandmarks = campusLandmarks.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: C.navBg, borderBottomColor: C.border }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="arrow-left" size={18} color={C.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>📍 Campus GPS & Map Telemetry</Text>
          <Text style={[styles.headerSub, { color: C.textMuted }]}>Swaminarayan University, Kalol Campus landmarks</Text>
        </View>
        <Button
          title="Recenter"
          size="sm"
          variant="outline"
          onPress={handleRecenter}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* GPS Telemetry Card */}
        <GlassCard topAccent={C.cyan} style={styles.gpsCard}>
          <View style={styles.gpsTopRow}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: isWatching ? C.emerald : C.amber }]} />
              <Text style={[styles.liveText, { color: isWatching ? C.emerald : C.amber }]}>
                {isWatching ? 'GPS ACTIVE' : 'PAUSED'}
              </Text>
            </View>
            <Badge label={`±${coords.accuracy}m Accuracy`} variant="neutral" />
          </View>

          <View style={styles.coordsRow}>
            <View style={styles.coordBox}>
              <Text style={[styles.coordLabel, { color: C.textDim }]}>LATITUDE</Text>
              <Text style={[styles.coordVal, { color: C.textPrimary }]}>{coords.latitude.toFixed(6)}° N</Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={[styles.coordLabel, { color: C.textDim }]}>LONGITUDE</Text>
              <Text style={[styles.coordVal, { color: C.textPrimary }]}>{coords.longitude.toFixed(6)}° E</Text>
            </View>
          </View>

          <View style={[styles.addressBox, { backgroundColor: C.bgSubtle, borderColor: C.border }]}>
            <Icon name="map-pin" size={16} color={C.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.addressText, { color: C.textSecondary }]}>{address}</Text>
          </View>
        </GlassCard>

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: C.bgInput, borderColor: C.border }]}>
          <Icon name="search" size={16} color={C.textDim} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: C.textPrimary }]}
            placeholder="Search campus buildings, labs, pickup spots..."
            placeholderTextColor={C.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Landmarks List */}
        <Text style={[styles.sectionHeading, { color: C.textPrimary }]}>🏛️ Campus Buildings & Pickup Spots</Text>
        <View style={styles.landmarksList}>
          {filteredLandmarks.map((lm, idx) => {
            const isSelected = selectedSpot === lm.name;
            return (
              <TouchableOpacity key={idx} activeOpacity={0.8} onPress={() => handleSelectLandmark(lm)}>
                <GlassCard
                  topAccent={isSelected ? C.primary : undefined}
                  style={[styles.lmCard, isSelected && { borderColor: C.primary, backgroundColor: C.primaryLight }]}
                >
                  <View style={[styles.lmIconBox, { backgroundColor: C.bgSubtle }]}>
                    <Icon name={lm.icon} size={18} color={isSelected ? C.primary : C.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lmName, { color: C.textPrimary }, isSelected && { color: C.primary, fontWeight: '700' }]}>
                      {lm.name}
                    </Text>
                    <Text style={[styles.lmCategory, { color: C.textMuted }]}>{lm.category}</Text>
                  </View>
                  {isSelected && <Badge label="SELECTED" variant="primary" />}
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  content: { padding: 16, paddingBottom: 90 },
  gpsCard: { padding: 18, marginBottom: 14 },
  gpsTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  coordsRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  coordBox: { flex: 1 },
  coordLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  coordVal: { fontSize: 16, fontWeight: '700' },
  addressBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  addressText: { fontSize: 12, flex: 1, lineHeight: 17 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 16
  },
  searchInput: { flex: 1, fontSize: 13 },
  sectionHeading: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  landmarksList: { gap: 8 },
  lmCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  lmIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  lmName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  lmCategory: { fontSize: 12 }
});
