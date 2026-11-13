import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const EVENTS = [
  {
    id: '1',
    title: 'Hackathon SIH Campus Qualifiers',
    category: 'Technology',
    tagColor: '#EFF6FF',
    tagText: '#2563EB',
    date: '28 Nov 2026',
    time: '09:00 AM - 06:00 PM',
    venue: 'Auditorium Hall A',
    seatsLeft: 14,
    registered: false,
  },
  {
    id: '2',
    title: 'Annual Cultural Fest — Alma Symphony',
    category: 'Cultural',
    tagColor: '#F3E8FF',
    tagText: '#7C3AED',
    date: '05 Dec 2026',
    time: '05:00 PM - 10:00 PM',
    venue: 'Main Campus Amphitheater',
    seatsLeft: 85,
    registered: true,
  },
  {
    id: '3',
    title: 'Pendaftaran Program Magang Bersertifikat BUMN',
    category: 'Career',
    tagColor: '#FEF3C7',
    tagText: '#D97706',
    date: '12 Dec 2026',
    time: '11:00 AM - 01:00 PM',
    venue: 'Placement Cell Hall 2',
    seatsLeft: 30,
    registered: false,
  },
];

const NOTICES = [
  {
    id: '101',
    tag: 'Berita Kampus',
    tagColor: '#FEE2E2',
    tagText: '#DC2626',
    title: 'Tembus Melebihi Kuota, Kampus Rangkul 2.300 Mahasiswa Baru Jalur Mandiri',
    date: '13 Jul 2026',
  },
  {
    id: '102',
    tag: 'Akademik',
    tagColor: '#EFF6FF',
    tagText: '#2563EB',
    title: 'Alur Yudisium Dan Wisuda Periode Agustus 2026 Terbuka',
    date: '19 Jul 2026',
  },
];

export default function EventsScreen() {
  const [filter, setFilter] = useState<'events' | 'notices'>('events');
  const [eventsList, setEventsList] = useState(EVENTS);

  const toggleRegister = (id: string) => {
    setEventsList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, registered: !e.registered } : e))
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events & Notices</Text>
        <Text style={styles.headerSubtitle}>Discover campus fests, workshops & official notices</Text>
      </View>

      {/* Segment Selector */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, filter === 'events' && styles.segmentBtnActive]}
          onPress={() => setFilter('events')}
        >
          <Text style={[styles.segmentText, filter === 'events' && styles.segmentTextActive]}>
            Upcoming Events ({eventsList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, filter === 'notices' && styles.segmentBtnActive]}
          onPress={() => setFilter('notices')}
        >
          <Text style={[styles.segmentText, filter === 'notices' && styles.segmentTextActive]}>
            Campus Notices ({NOTICES.length})
          </Text>
        </TouchableOpacity>
      </View>

      {filter === 'events' ? (
        <View style={styles.list}>
          {eventsList.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={[styles.categoryTag, { backgroundColor: event.tagColor }]}>
                  <Text style={[styles.categoryText, { color: event.tagText }]}>{event.category}</Text>
                </View>
                <Text style={styles.seatsText}>⚡ {event.seatsLeft} seats left</Text>
              </View>

              <Text style={styles.eventTitle}>{event.title}</Text>

              <View style={styles.eventDetails}>
                <Text style={styles.detailRow}>📅 {event.date} · {event.time}</Text>
                <Text style={styles.detailRow}>📍 {event.venue}</Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.regBtn, event.registered && styles.regBtnRegistered]}
                  onPress={() => toggleRegister(event.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.regBtnText, event.registered && styles.regBtnTextRegistered]}>
                    {event.registered ? '✓ Registered' : 'Register Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.list}>
          {NOTICES.map((notice) => (
            <View key={notice.id} style={styles.noticeCard}>
              <View style={styles.noticeHeader}>
                <View style={[styles.categoryTag, { backgroundColor: notice.tagColor }]}>
                  <Text style={[styles.categoryText, { color: notice.tagText }]}>{notice.tag}</Text>
                </View>
                <Text style={styles.noticeDate}>📅 {notice.date}</Text>
              </View>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
            </View>
          ))}
        </View>
      )}
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
    marginBottom: 18,
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
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
  list: {
    gap: 14,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  seatsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172B4D',
    lineHeight: 22,
    marginBottom: 8,
  },
  eventDetails: {
    gap: 4,
    marginBottom: 14,
  },
  detailRow: {
    fontSize: 13,
    color: '#64748B',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
  },
  regBtn: {
    flex: 1,
    backgroundColor: '#16A36A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  regBtnRegistered: {
    backgroundColor: '#E8F5EE',
    borderWidth: 1,
    borderColor: '#16A36A',
  },
  regBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  regBtnTextRegistered: {
    color: '#16A36A',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172B4D',
    lineHeight: 20,
  },
});
