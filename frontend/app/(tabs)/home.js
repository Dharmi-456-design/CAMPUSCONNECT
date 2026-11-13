import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

/**
 * CampusOne Home Dashboard
 * Inspired by UI Image 1, 3 & 4:
 * - Student Greeting Header
 * - "You've got 4 classes today — Ready to finish today!" with progress checks
 * - Segmented tabs: Upcoming Class, My Syllabus, Routine
 * - Next Class Card & Timeline Syllabus Overview
 * - Quick Actions & Recent Notices
 */
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('upcoming');

  const QUICK_ACTIONS = [
    { id: 'academics', label: 'Academics', icon: '📊', bg: '#EFF6FF', route: '/(tabs)/academics' },
    { id: 'notes', label: 'Notes', icon: '📝', bg: '#ECFEFF', route: '/(tabs)/academics' },
    { id: 'events', label: 'Events', icon: '📅', bg: '#FEF3C7', route: '/(tabs)/events' },
    { id: 'notices', label: 'Notices', icon: '📢', bg: '#FEE2E2', route: '/(tabs)/events' },
    { id: 'lostfound', label: 'Lost & Found', icon: '🔍', bg: '#F3E8FF', route: '/(tabs)/community' },
    { id: 'community', label: 'Community', icon: '💬', bg: '#DCFCE7', route: '/(tabs)/community' },
  ];

  const SYLLABUS_CHAPTERS = [
    { id: '1', title: 'Chapter 1: Set & Function', lessons: '8 Lessons', status: 'completed' },
    { id: '2', title: 'Chapter 2: Geometry & Graph Theory', lessons: '10 Lessons', status: 'completed' },
    { id: '3', title: 'Chapter 3: Infinite Series & Calculus', lessons: '8 Lessons', status: 'current' },
    { id: '4', title: 'Chapter 4: Trigonometry & Transforms', lessons: '10 Lessons', status: 'pending' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. Header with Student Greeting (Inspired by Image 1) */}
      <View style={styles.topHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>MA</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greetingText}>Good Morning 👋</Text>
            <Text style={styles.userName}>Michael Aguero</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/(tabs)/events')}
          activeOpacity={0.7}
        >
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      {/* 2. Banner: "You've got six classes - Ready to finish today!" (Inspired by Image 1) */}
      <View style={styles.classesBanner}>
        <View style={styles.bannerHeader}>
          <View style={styles.bannerIconBox}>
            <Text style={{ fontSize: 24 }}>📖</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>You've got 4 classes</Text>
            <Text style={styles.bannerSubtitle}>Ready to finish today!</Text>
          </View>
        </View>

        {/* Status checks */}
        <View style={styles.checksRow}>
          {['1', '2', '3', '4'].map((num, i) => (
            <View
              key={num}
              style={[
                styles.checkCircle,
                i < 2 ? styles.checkDone : i === 2 ? styles.checkCurrent : styles.checkUpcoming,
              ]}
            >
              <Text
                style={[
                  styles.checkText,
                  i < 2 ? styles.checkTextDone : i === 2 ? styles.checkTextCurrent : styles.checkTextUpcoming,
                ]}
              >
                {i < 2 ? '✓' : num}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Horizontal Pill Tabs: Upcoming Class, My Syllabus, Routine (Inspired by Image 1) */}
      <View style={styles.tabPillsRow}>
        {[
          { key: 'upcoming', label: 'Upcoming class' },
          { key: 'syllabus', label: 'My Syllabus' },
          { key: 'routine', label: 'Routine' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabPillText, activeTab === tab.key && styles.tabPillTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. Active Tab Content */}
      {activeTab === 'upcoming' && (
        <View style={styles.upcomingClassCard}>
          <View style={styles.classTopRow}>
            <View style={styles.classTag}>
              <Text style={{ fontSize: 13 }}>⏰</Text>
              <Text style={styles.classTagText}>10:00 AM - 10:45 AM</Text>
            </View>
            <View style={styles.roomBadge}>
              <Text style={styles.roomText}>Lab 3 · Room 204</Text>
            </View>
          </View>

          <Text style={styles.classSubject}>Higher Mathematics</Text>
          <Text style={styles.classChapter}>Chapter 7: Infinite Series & Convergence</Text>

          <View style={styles.classFooter}>
            <Text style={styles.instructorText}>👤 Dr. Alok Verma</Text>
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => router.push('/(tabs)/academics')}
              activeOpacity={0.85}
            >
              <Text style={styles.joinBtnText}>View Notes ›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'syllabus' && (
        <View style={styles.syllabusCard}>
          <Text style={styles.sectionHeading}>Syllabus Overview</Text>
          <View style={styles.timeline}>
            {SYLLABUS_CHAPTERS.map((ch, idx) => (
              <View key={ch.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineNode,
                      ch.status === 'completed' && styles.nodeCompleted,
                      ch.status === 'current' && styles.nodeCurrent,
                    ]}
                  />
                  {idx < SYLLABUS_CHAPTERS.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.chapterTitle}>{ch.title}</Text>
                  <Text style={styles.chapterLessons}>{ch.lessons}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'routine' && (
        <View style={styles.routineCard}>
          <Text style={styles.sectionHeading}>Today's Routine</Text>
          <View style={styles.routineList}>
            <View style={styles.routineItem}>
              <Text style={styles.routineTime}>09:00 - 10:00</Text>
              <Text style={styles.routineName}>Operating Systems Tutorial</Text>
            </View>
            <View style={styles.routineItem}>
              <Text style={styles.routineTime}>10:00 - 10:45</Text>
              <Text style={styles.routineName}>Higher Mathematics Lecture</Text>
            </View>
            <View style={styles.routineItem}>
              <Text style={styles.routineTime}>11:30 - 12:45</Text>
              <Text style={styles.routineName}>Web Tech Frameworks Lab</Text>
            </View>
          </View>
        </View>
      )}

      {/* 5. Campus Services Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Campus Services</Text>
      </View>
      <View style={styles.gridContainer}>
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.gridItem}
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.gridIconBox, { backgroundColor: item.bg }]}>
              <Text style={styles.gridIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 6. Recent Notices */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Notices</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
          <Text style={styles.seeAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.noticeCard}
        onPress={() => router.push('/(tabs)/events')}
        activeOpacity={0.8}
      >
        <View style={styles.noticeTopRow}>
          <View style={styles.noticeTag}>
            <Text style={styles.noticeTagText}>Campus Notice</Text>
          </View>
          <Text style={{ fontSize: 16 }}>🔖</Text>
        </View>
        <Text style={styles.noticeHeading}>
          Alur Yudisium Dan Wisuda Periode Semester Genap 2026/2027
        </Text>
        <View style={styles.noticeFooter}>
          <Text style={styles.noticeDate}>📅 19 Jul 2026</Text>
          <Text style={styles.noticeAuthor}>Academic Affairs</Text>
        </View>
      </TouchableOpacity>
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
    paddingBottom: 36,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  greetingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172B4D',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
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
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  classesBanner: {
    backgroundColor: '#172B4D',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  checksRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: '#16A36A',
  },
  checkCurrent: {
    backgroundColor: '#FFFFFF',
  },
  checkUpcoming: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  checkText: {
    fontSize: 12,
    fontWeight: '800',
  },
  checkTextDone: {
    color: '#FFFFFF',
  },
  checkTextCurrent: {
    color: '#172B4D',
  },
  checkTextUpcoming: {
    color: '#94A3B8',
  },
  tabPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#E8F5EE',
    borderColor: '#16A36A',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#16A36A',
    fontWeight: '800',
  },
  upcomingClassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 22,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  classTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  classTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A36A',
  },
  roomBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  classSubject: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 4,
  },
  classChapter: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  instructorText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  joinBtn: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  joinBtnText: {
    color: '#16A36A',
    fontSize: 12,
    fontWeight: '700',
  },
  syllabusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  nodeCompleted: {
    backgroundColor: '#16A36A',
  },
  nodeCurrent: {
    backgroundColor: '#2563EB',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172B4D',
  },
  chapterLessons: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  routineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 22,
  },
  routineList: {
    gap: 10,
  },
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  routineTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A36A',
  },
  routineName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172B4D',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172B4D',
  },
  seeAllText: {
    fontSize: 12,
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
    width: '30%',
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
  },
  noticeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  noticeHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172B4D',
    lineHeight: 20,
    marginBottom: 10,
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
});
