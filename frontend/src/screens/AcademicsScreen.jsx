import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';

const SEMESTER_SUBJECTS = [
  {
    code: 'FIK0M007',
    name: 'Sistem Operasi',
    sks: 3,
    kredit: '3.75',
    total: '11.25',
    grade: 'A-',
    notesCount: 6,
    lecturer: 'Budi Santoso S.Kom, M.Kom',
    schedule: 'Selasa, 13:30 - 16:00',
  },
  {
    code: 'FIK0M009',
    name: 'Statistika Dan Probabilitas',
    sks: 3,
    kredit: '4.00',
    total: '12.00',
    grade: 'A',
    notesCount: 4,
    lecturer: 'Dra. Endang Wahyuni M.Sc',
    schedule: 'Senin, 08:00 - 10:30',
  },
  {
    code: 'SI008',
    name: 'Perencanaan Strategis Sistem',
    sks: 2,
    kredit: '3.75',
    total: '7.50',
    grade: 'A-',
    notesCount: 5,
    lecturer: 'Agung Mulya S.Kom, M.Eng',
    schedule: 'Rabu, 10:00 - 11:40',
  },
  {
    code: 'SI011',
    name: 'Organisasi Komputer',
    sks: 3,
    kredit: '3.50',
    total: '10.50',
    grade: 'B+',
    notesCount: 8,
    lecturer: 'Yuli Yuniar S.Kom, M.Kom',
    schedule: 'Kamis, 08:00 - 10:30',
  },
  {
    code: 'SI013',
    name: 'Riset Operasi',
    sks: 3,
    kredit: '4.00',
    total: '12.00',
    grade: 'A',
    notesCount: 3,
    lecturer: 'Dr. Ir. Bambang Hermanto',
    schedule: 'Jumat, 13:30 - 16:00',
  },
];

export default function AcademicsScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [activeTab, setActiveTab] = useState('khs'); // 'khs' | 'krs' | 'transcript'

  const handleDownloadNotes = (subjectName) => {
    const msg = `Downloading complete verified notes and exam prep cheat sheet for ${subjectName}.`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Download Verified Notes', msg);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
      contentContainerStyle={[styles.contentContainer, isDesktop && styles.desktopContainer]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.screenTitle, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
            Kartu Hasil Studi
          </Text>
          <Text style={[styles.screenSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Academic Standing & Grade Performance
          </Text>
        </View>
        <TouchableOpacity style={styles.downloadPdfBtn} onPress={() => handleDownloadNotes('All Subjects')}>
          <Icon name="download" size={16} color="#16A36A" />
          <Text style={styles.downloadPdfText}>Unduh KHS</Text>
        </TouchableOpacity>
      </View>

      {/* Semester Dropdown Pill (Alma Ata style) */}
      <View style={[styles.semesterCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
        <Text style={[styles.semesterTitle, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
          Semester 5 - 2026/2027 Ganjil
        </Text>
        <Icon name="chevron-down" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
      </View>

      {/* GPA & Credits Scorecard (Alma Ata style) */}
      <View style={[styles.scorecard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Indeks Prestasi Semester</Text>
          <Text style={[styles.scoreVal, { color: '#16A36A' }]}>3.84</Text>
        </View>
        <View style={[styles.scoreDivider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Jumlah Total SKS</Text>
          <Text style={[styles.scoreVal, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>21</Text>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
          Mata Kuliah Yang Ditempuh
        </Text>
        <Text style={styles.subjectCountBadge}>5 Mata Kuliah</Text>
      </View>

      {/* Course List Cards */}
      <View style={styles.courseList}>
        {SEMESTER_SUBJECTS.map((item) => (
          <View
            key={item.code}
            style={[styles.subjectCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
          >
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subjectName, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
                  {item.name}
                </Text>
                <Text style={styles.subjectCode}>{item.code}  •  {item.schedule}</Text>
              </View>
              <View style={[styles.gradeBadge, item.grade === 'A' ? styles.gradeA : styles.gradeOther]}>
                <Text style={styles.gradeText}>{item.grade}</Text>
              </View>
            </View>

            {/* Metrics Row: SKS, Kredit, Total, Nilai */}
            <View style={[styles.metricsRow, { borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>SKS</Text>
                <Text style={[styles.metricVal, { color: isDark ? '#E2E8F0' : '#172B4D' }]}>{item.sks}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Kredit</Text>
                <Text style={[styles.metricVal, { color: isDark ? '#E2E8F0' : '#172B4D' }]}>{item.kredit}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Total</Text>
                <Text style={[styles.metricVal, { color: isDark ? '#E2E8F0' : '#172B4D' }]}>{item.total}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Nilai</Text>
                <Text style={[styles.metricVal, { color: '#16A36A', fontWeight: '800' }]}>{item.grade}</Text>
              </View>
            </View>

            {/* Lecturer & Notes Button */}
            <View style={[styles.cardFooter, { borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <Text style={[styles.lecturerText, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                👨‍🏫 {item.lecturer}
              </Text>
              <TouchableOpacity
                style={styles.notesDownloadBtn}
                onPress={() => handleDownloadNotes(item.name)}
              >
                <Icon name="book" size={13} color="#16A36A" />
                <Text style={styles.notesDownloadText}>{item.notesCount} Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  desktopContainer: {
    maxWidth: 820,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  screenSub: {
    fontSize: 12,
    marginTop: 2,
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  downloadPdfText: {
    color: '#16A36A',
    fontSize: 12,
    fontWeight: '700',
  },
  semesterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  semesterTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scorecard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  scoreVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  scoreDivider: {
    width: 1,
    height: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subjectCountBadge: {
    fontSize: 12,
    color: '#16A36A',
    fontWeight: '600',
  },
  courseList: {
    gap: 12,
  },
  subjectCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
  },
  subjectCode: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeA: {
    backgroundColor: '#DCFCE7',
  },
  gradeOther: {
    backgroundColor: '#E0F2FE',
  },
  gradeText: {
    color: '#16A36A',
    fontSize: 13,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  lecturerText: {
    fontSize: 11,
    flex: 1,
  },
  notesDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  notesDownloadText: {
    color: '#16A36A',
    fontSize: 11,
    fontWeight: '700',
  },
});

