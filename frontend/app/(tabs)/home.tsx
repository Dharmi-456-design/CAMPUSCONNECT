import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  const QUICK_ACTIONS = [
    { id: 'academics', label: 'Academics', icon: '📊', bg: '#EFF6FF', route: '/(tabs)/academics' },
    { id: 'notes', label: 'Notes', icon: '📝', bg: '#ECFEFF', route: '/(tabs)/academics' },
    { id: 'events', label: 'Events', icon: '📅', bg: '#FEF3C7', route: '/(tabs)/events' },
    { id: 'notices', label: 'Notices', icon: '📢', bg: '#FEE2E2', route: '/(tabs)/events' },
    { id: 'lostfound', label: 'Lost & Found', icon: '🔍', bg: '#F3E8FF', route: '/(tabs)/community' },
    { id: 'community', label: 'Community', icon: '💬', bg: '#DCFCE7', route: '/(tabs)/community' },
    { id: 'attendance', label: 'Attendance', icon: '✅', bg: '#E0F2FE', route: '/(tabs)/home' },
    { id: 'more', label: 'More', icon: '⚡', bg: '#F1F5F9', route: '/(tabs)/profile' },
  ];

  const COURSES = [
    {
      id: '1',
      code: 'CS301',
      title: 'Web & Framework Dev',
      instructor: 'Dr. Alok Verma',
      time: '10:00 - 12:00',
      room: 'Lab 3',
      color: '#16A36A',
    },
    {
      id: '2',
      code: 'CS304',
      title: 'Data Mining & AI',
      instructor: 'Prof. Ananya Sen',
      time: '13:30 - 15:30',
      room: 'Room 204',
      color: '#2563EB',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Student Profile Banner Card (Inspired by Screenshot 2) */}
      <View style={styles.profileBanner}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>MA</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.studentName}>Michael Aguero</Text>
            <Text style={styles.studentId}>ID: 17081010086 · CS '27</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* 3 Academic Metrics Pills */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Credits</Text>
            <Text style={styles.metricValue}>89 SKS</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Cumulative GPA</Text>
            <Text style={[styles.metricValue, { color: '#16A36A' }]}>3.67</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Semester</Text>
            <Text style={styles.metricValue}>06</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Campus Services</Text>
      </View>
      <View style={styles.gridContainer}>
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.gridItem}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.gridIconBox, { backgroundColor: item.bg }]}>
              <Text style={styles.gridIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Notices (Berita Terbaru) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Notices</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
          <Text style={styles.seeAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.noticeCard}>
        <View style={styles.noticeTopRow}>
          <View style={styles.noticeTag}>
            <Text style={styles.noticeTagText}>Campus Notice</Text>
          </View>
          <Text style={styles.noticeBookmark}>🔖</Text>
        </View>
        <Text style={styles.noticeHeading}>
          Alur Yudisium Dan Wisuda Semester Genap 2026/2027
        </Text>
        <View style={styles.noticeFooter}>
          <Text style={styles.noticeDate}>📅 19 Jul 2026</Text>
          <Text style={styles.noticeAuthor}>Academic Affairs</Text>
        </View>
      </View>

      {/* Today's Courses (Mata Kuliah) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Classes (2)</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/academics')}>
          <Text style={styles.seeAllText}>Timetable ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coursesList}>
        {COURSES.map((course) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={[styles.courseColorBar, { backgroundColor: course.color }]} />
            <View style={styles.courseContent}>
              <View style={styles.courseTopRow}>
                <Text style={styles.courseCode}>{course.code}</Text>
                <View style={styles.roomTag}>
                  <Text style={styles.roomText}>{course.room}</Text>
                </View>
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <View style={styles.courseBottomRow}>
                <Text style={styles.courseInstructor}>👤 {course.instructor}</Text>
                <Text style={styles.courseTime}>⏰ {course.time}</Text>
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
  profileBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172B4D',
  },
  studentId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifIcon: {
    fontSize: 18,
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172B4D',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172B4D',
  },
  seeAllText: {
    fontSize: 13,
    color: '#16A36A',
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    gap: 12,
  },
  gridItem: {
    width: '22%',
    alignItems: 'center',
    gap: 6,
  },
  gridIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIcon: {
    fontSize: 22,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#172B4D',
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  noticeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noticeTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noticeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  noticeBookmark: {
    fontSize: 16,
  },
  noticeHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
    lineHeight: 22,
    marginBottom: 12,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeDate: {
    fontSize: 12,
    color: '#64748B',
  },
  noticeAuthor: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  coursesList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  courseColorBar: {
    width: 6,
  },
  courseContent: {
    flex: 1,
    padding: 16,
  },
  courseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A36A',
  },
  roomTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 8,
  },
  courseBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInstructor: {
    fontSize: 12,
    color: '#64748B',
  },
  courseTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
