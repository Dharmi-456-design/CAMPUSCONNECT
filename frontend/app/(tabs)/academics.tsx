import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const SUBJECTS = [
  {
    code: 'FIK0M007',
    name: 'Sistem Operasi (OS)',
    sks: 3,
    grade: 'A-',
    kredit: '3.75',
    total: '11.25',
    notesCount: 6,
  },
  {
    code: 'FIK0M009',
    name: 'Statistika Dan Probabilitas',
    sks: 3,
    grade: 'A',
    kredit: '4.00',
    total: '12.00',
    notesCount: 4,
  },
  {
    code: 'SI008',
    name: 'Perencanaan Strategis Sistem',
    sks: 2,
    grade: 'A-',
    kredit: '3.75',
    total: '7.50',
    notesCount: 5,
  },
  {
    code: 'SI011',
    name: 'Organisasi Komputer & Arch',
    sks: 3,
    grade: 'B+',
    kredit: '3.50',
    total: '10.50',
    notesCount: 8,
  },
  {
    code: 'SI013',
    name: 'Riset Operasi & Optimization',
    sks: 3,
    grade: 'A',
    kredit: '4.00',
    total: '12.00',
    notesCount: 3,
  },
];

export default function AcademicsScreen() {
  const [activeTab, setActiveTab] = useState<'krs' | 'notes'>('krs');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kartu Hasil Studi</Text>
        <Text style={styles.headerSubtitle}>Academic Record & Study Materials</Text>
      </View>

      {/* Semester Dropdown / Filter Pill */}
      <View style={styles.semesterPill}>
        <Text style={styles.semesterText}>Semester 5 — 2026/2027 Ganjil</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </View>

      {/* Summary Score Card (Inspired by Screenshot 2) */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Indeks Prestasi (IPS)</Text>
          <Text style={styles.scoreValue}>3.84</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Jumlah Total SKS</Text>
          <Text style={styles.scoreValue}>21</Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'krs' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('krs')}
        >
          <Text style={[styles.segmentText, activeTab === 'krs' && styles.segmentTextActive]}>
            Courses & Grades
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'notes' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.segmentText, activeTab === 'notes' && styles.segmentTextActive]}>
            Lecture Notes (26)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subject List Cards */}
      <View style={styles.listContainer}>
        {SUBJECTS.map((sub) => (
          <View key={sub.code} style={styles.subjectCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectName}>{sub.name}</Text>
                <Text style={styles.subjectCode}>{sub.code}</Text>
              </View>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>{sub.grade}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>SKS</Text>
                <Text style={styles.statVal}>{sub.sks}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Kredit</Text>
                <Text style={styles.statVal}>{sub.kredit}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statVal}>{sub.total}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Notes</Text>
                <Text style={[styles.statVal, { color: '#16A36A' }]}>{sub.notesCount} PDFs</Text>
              </View>
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172B4D',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  semesterPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  semesterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172B4D',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#64748B',
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
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
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16A36A',
  },
  scoreDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#172B4D',
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
  },
  subjectCode: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A36A',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172B4D',
  },
});
