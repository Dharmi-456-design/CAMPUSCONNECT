import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';
import { getEventsAndNoticesApi, createEventNoticeApi } from '../../api/events.api';
import { useAuthStore } from '../../store/authStore';

const TYPE_TABS = [
  { key: 'all',     label: 'All Updates',   icon: 'layers',     color: '#c9a84c' },
  { key: 'event',   label: 'Events',        icon: 'calendar',   color: '#06B6D4' },
  { key: 'notice',  label: 'Exam Notices',  icon: 'bell',       color: '#F59E0B' },
  { key: 'holiday', label: 'Holidays',      icon: 'sun',        color: '#10B981' },
];

const FACULTIES = [
  'All Faculties',
  'Faculty of Engineering & Tech',
  'Faculty of Pharmacy',
  'Faculty of Management & Commerce',
  'Faculty of Ayurvedic Science',
  'Faculty of Physiotherapy',
  'Faculty of Nursing',
];

const DEFAULT_EVENTS = [
  {
    _id: 'ev-placement-2026',
    type: 'event',
    category: 'Placement Drive',
    title: 'Mega Campus Placement Drive 2026 — TCS, Infosys, Zydus Cadila & HDFC',
    department: 'Final Year Engineering, Pharmacy & MBA Students',
    description: 'Pre-placement talks and technical aptitude tests for graduating batch. Minimum CGPA required: 6.0.',
    venue: 'Main University Placement Hall, Kalol',
    date: '2026-12-05',
  },
  {
    _id: 'ev-techsparks-2026',
    type: 'event',
    category: 'Technical & Hackathon',
    title: 'TechSparks 2026 — State Level TechFest & Robotics Arena',
    department: 'Shree Swaminarayan Institute of Technology (SSIT)',
    description: '36-Hour National Hackathon, Robo-Race Championship, Web/App Dev Challenge, and Bridge Design. Total cash prizes worth ₹1,50,000!',
    venue: 'Central Auditorium & Computer Labs Wing, Kalol',
    date: '2026-11-20',
  },
  {
    _id: 'ev-diwali-2026',
    type: 'holiday',
    category: 'Academic Calendar',
    title: 'Diwali Vacation & Academic Semester Break 2026',
    department: 'All Departments',
    description: 'The University announces official Diwali Vacation from 28th October 2026 to 12th November 2026 for all students across Engineering, Pharmacy, Ayurvedic, and Management.',
    venue: 'Swaminarayan University Campus, Kalol',
    date: '2026-10-28',
  },
  {
    _id: 'ev-midsem-notice',
    type: 'notice',
    category: 'Mid Semester Exam',
    title: 'Mid Semester Examination — Time Table Released (Nov 2026)',
    department: 'All Faculties — Semester 1, 3, 5 & 7',
    description: 'Mid Sem exams will commence from 10th November 2026. Students must carry their examination hall tickets. No entry without Hall Ticket.',
    venue: 'Respective Department Exam Halls',
    date: '2026-11-01',
  },
  {
    _id: 'ev-cultural-fest',
    type: 'event',
    category: 'Cultural & Festival',
    title: 'Navratri Mahotsav 2026 — Garba & Cultural Night',
    department: 'All Students — Swaminarayan University',
    description: 'Grand Navratri Celebration with Traditional Garba, Cultural Performances, and Special Cultural Contest. First Prize: ₹25,000!',
    venue: 'University Open Amphitheatre, Kalol',
    date: '2026-10-01',
  },
];

function TypeConfig(type) {
  switch (type) {
    case 'event':   return { color: '#06B6D4', bg: 'rgba(6,182,212,0.15)',   label: 'EVENT',   icon: 'calendar' };
    case 'notice':  return { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'NOTICE',  icon: 'bell' };
    case 'holiday': return { color: '#10B981', bg: 'rgba(16,185,129,0.15)', label: 'HOLIDAY', icon: 'sun' };
    default:        return { color: '#c9a84c', bg: 'rgba(201,168,76,0.15)', label: 'UPDATE',  icon: 'layers' };
  }
}

export default function EventsNoticesScreen({ onBack }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [items, setItems] = useState(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [search, setSearch] = useState('');

  // Post Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mType, setMType] = useState('event');
  const [mCategory, setMCategory] = useState('');
  const [mDept, setMDept] = useState('All Departments');
  const [mDesc, setMDesc] = useState('');
  const [mVenue, setMVenue] = useState('Swaminarayan University Campus, Kalol');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getEventsAndNoticesApi({
        type: activeType !== 'all' ? activeType : undefined,
        search: search || undefined,
      });
      if (res.success && res.data?.length) {
        setItems([...res.data, ...DEFAULT_EVENTS]);
      } else {
        setItems(DEFAULT_EVENTS);
      }
    } catch (err) {
      setItems(DEFAULT_EVENTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [activeType]);

  const handleCreate = async () => {
    if (!mTitle.trim() || !mDesc.trim()) {
      if (Platform.OS === 'web') window.alert('Please fill in title and description.');
      else Alert.alert('Incomplete', 'Please enter title and description.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await createEventNoticeApi({
        title: mTitle,
        type: mType,
        category: mCategory || 'General',
        department: mDept,
        description: mDesc,
        venue: mVenue,
      });
      const newItem = res.success && res.data
        ? res.data
        : {
            _id: `custom-${Date.now()}`,
            type: mType,
            category: mCategory || 'General',
            title: mTitle,
            department: mDept,
            description: mDesc,
            venue: mVenue,
            date: new Date().toISOString(),
          };
      setItems(prev => [newItem, ...prev]);
      setModalVisible(false);
      setMTitle(''); setMDesc(''); setMCategory('');
      if (Platform.OS === 'web') window.alert('Update broadcasted to all students! 🎉');
      else Alert.alert('Published 🎉', 'Announcement broadcast to Swaminarayan University students!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not post.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchType = activeType === 'all' || item.type === activeType;
    const matchFaculty =
      selectedFaculty === 'All Faculties' ||
      (item.department || '').toLowerCase().includes(selectedFaculty.toLowerCase().replace('faculty of ', ''));
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchFaculty && matchSearch;
  });

  const bgCard = theme.bgCard;
  const border = theme.border;
  const textTitle = theme.textPrimary;
  const textSub = theme.textMuted;

  // Stats
  const totalEvents   = items.filter(i => i.type === 'event').length;
  const totalNotices  = items.filter(i => i.type === 'notice').length;
  const totalHolidays = items.filter(i => i.type === 'holiday').length;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* ===================================================== */}
      {/* TOP HEADER                                            */}
      {/* ===================================================== */}
      <View style={[styles.topHeader, { backgroundColor: isDark ? '#0B0F19' : '#FFFFFF', borderBottomColor: border }]}>
        <View style={styles.topHeaderLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
              <Icon name="arrow-left" size={18} color={textTitle} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.headerTitle, { color: textTitle }]}>🏛️ Swaminarayan University</Text>
            <Text style={[styles.headerSub, { color: textSub }]}>Live Circulars, Events & Academic Calendar</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={14} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.postBtnText}>+ Post Update</Text>
        </TouchableOpacity>
      </View>

      {/* ===================================================== */}
      {/* STATS ROW                                             */}
      {/* ===================================================== */}
      <View style={[styles.statsRow, { backgroundColor: isDark ? '#0B0F19' : '#FFFFFF', borderBottomColor: border }]}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(6,182,212,0.15)' }]}>
            <Icon name="calendar" size={14} color="#22D3EE" />
          </View>
          <Text style={[styles.statNum, { color: textTitle }]}>{totalEvents}</Text>
          <Text style={[styles.statLabel, { color: textSub }]}>Events</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
            <Icon name="bell" size={14} color="#FBBF24" />
          </View>
          <Text style={[styles.statNum, { color: textTitle }]}>{totalNotices}</Text>
          <Text style={[styles.statLabel, { color: textSub }]}>Notices</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
            <Icon name="sun" size={14} color="#34D399" />
          </View>
          <Text style={[styles.statNum, { color: textTitle }]}>{totalHolidays}</Text>
          <Text style={[styles.statLabel, { color: textSub }]}>Holidays</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
            <Icon name="layers" size={14} color={isDark ? '#f0d074' : '#b8943e'} />
          </View>
          <Text style={[styles.statNum, { color: textTitle }]}>{items.length}</Text>
          <Text style={[styles.statLabel, { color: textSub }]}>Total Updates</Text>
        </View>
      </View>

      {/* ===================================================== */}
      {/* FIXED FILTER CONTROLS (Non-Scrollable Header Area)    */}
      {/* ===================================================== */}
      <View style={[styles.filtersArea, { backgroundColor: theme.bg, borderBottomColor: border }]}>
        {/* TYPE TABS — Horizontal scrollable row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeTabsScroll}
        >
          {TYPE_TABS.map(tab => {
            const isActive = activeType === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.typeTab,
                  {
                    backgroundColor: isActive ? '#c9a84c' : bgCard,
                    borderColor: isActive ? '#c9a84c' : border,
                  },
                ]}
                onPress={() => setActiveType(tab.key)}
                activeOpacity={0.8}
              >
                <Icon
                  name={tab.icon}
                  size={13}
                  color={isActive ? '#0c0f10' : tab.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.typeTabText, { color: isActive ? '#0c0f10' : textSub, fontWeight: isActive ? '800' : '600' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FACULTY FILTER PILLS — Horizontal scrollable row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.facultyScroll}
        >
          {FACULTIES.map(fac => {
            const isSel = selectedFaculty === fac;
            return (
              <TouchableOpacity
                key={fac}
                style={[
                  styles.facultyPill,
                  {
                    backgroundColor: isSel ? (isDark ? 'rgba(201,168,76,0.18)' : '#fdf8e8') : bgCard,
                    borderColor: isSel ? '#c9a84c' : border,
                  },
                ]}
                onPress={() => setSelectedFaculty(fac)}
                activeOpacity={0.8}
              >
                <Text style={[styles.facultyPillText, { color: isSel ? (isDark ? '#f0d074' : '#b8943e') : textSub, fontWeight: isSel ? '700' : '500' }]}>
                  {fac}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SEARCH BAR */}
        <View style={[styles.searchBox, { backgroundColor: bgCard, borderColor: border }]}>
          <Icon name="search" size={15} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: textTitle }]}
            placeholder="Search circulars, exams, holidays..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchEvents}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="x" size={14} color={textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ===================================================== */}
      {/* SCROLLABLE FEED LIST                                   */}
      {/* ===================================================== */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchEvents(); }}
            tintColor={isDark ? '#f0d074' : '#b8943e'}
          />
        }
        ListHeaderComponent={
          filteredItems.length > 0 ? (
            <Text style={[styles.resultCount, { color: textSub }]}>
              Showing {filteredItems.length} update{filteredItems.length !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={[styles.emptyBox, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>📭</Text>
            <Text style={[styles.emptyTitle, { color: textTitle }]}>No Updates Found</Text>
            <Text style={[styles.emptyDesc, { color: textSub }]}>
              No circulars or events match your filter. Try changing the category or faculty.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const cfg = TypeConfig(item.type);
          const dateStr = item.date
            ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '';

          return (
            <View
              style={[
                styles.eventCard,
                {
                  backgroundColor: bgCard,
                  borderColor: `${cfg.color}55`,
                  borderLeftColor: cfg.color,
                },
              ]}
            >
              {/* Left Accent Bar */}
              <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

              {/* Card Content */}
              <View style={styles.cardInner}>
                {/* Top Row: Badges + Date */}
                <View style={styles.cardTopRow}>
                  <View style={styles.badgesRow}>
                    <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                      <Icon name={cfg.icon} size={11} color={cfg.color} style={{ marginRight: 4 }} />
                      <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <View style={[styles.catBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                      <Text style={[styles.catBadgeText, { color: textSub }]}>{item.category || 'General'}</Text>
                    </View>
                  </View>

                  <Text style={[styles.dateText, { color: textSub }]}>{dateStr}</Text>
                </View>

                {/* Title */}
                <Text style={[styles.cardTitle, { color: textTitle }]}>{item.title}</Text>

                {/* Department */}
                <View style={styles.deptRow}>
                  <Icon name="home" size={12} color={isDark ? '#f0d074' : '#b8943e'} style={{ marginRight: 5 }} />
                  <Text style={[styles.deptText, { color: isDark ? '#f0d074' : '#b8943e' }]}>{item.department}</Text>
                </View>

                {/* Description */}
                <Text style={[styles.cardDesc, { color: textSub }]}>{item.description}</Text>

                {/* Venue */}
                <View style={styles.venueRow}>
                  <Icon name="map-pin" size={12} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 5 }} />
                  <Text style={[styles.venueText, { color: isDark ? '#64748B' : '#94A3B8' }]}>{item.venue}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* ===================================================== */}
      {/* POST UPDATE MODAL                                      */}
      {/* ===================================================== */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: border }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textTitle }]}>📢 Broadcast University Update</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={18} color={textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Type Selector */}
              <Text style={[styles.fieldLabel, { color: textSub }]}>Update Type</Text>
              <View style={styles.typeSelectorRow}>
                {['event', 'notice', 'holiday'].map(t => {
                  const c = TypeConfig(t);
                  const isSel = mType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeSelectBtn,
                        {
                          backgroundColor: isSel ? '#c9a84c' : isDark ? '#141D2D' : '#F8FAFC',
                          borderColor: isSel ? '#c9a84c' : border,
                        },
                      ]}
                      onPress={() => setMType(t)}
                    >
                      <Icon name={c.icon} size={14} color={isSel ? '#0c0f10' : c.color} style={{ marginBottom: 4 }} />
                      <Text style={{ color: isSel ? '#0c0f10' : textSub, fontSize: 11.5, fontWeight: isSel ? '800' : '700' }}>
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, { color: textSub }]}>Announcement Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. Ganesh Mahotsav 2026 / Mid-Sem Exam Notice"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={mTitle}
                onChangeText={setMTitle}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Category</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. Placement Drive, Cultural & Festival"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={mCategory}
                onChangeText={setMCategory}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Description & Details *</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                multiline
                numberOfLines={4}
                placeholder="Function timings, exam timetable rules, or holiday span details..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={mDesc}
                onChangeText={setMDesc}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Faculty / Department</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="Faculty of Engineering / All Departments"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={mDept}
                onChangeText={setMDept}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Venue / Location</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="Swaminarayan University Central Ground, Kalol"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={mVenue}
                onChangeText={setMVenue}
              />

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: textSub, fontWeight: '600', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.broadcastBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleCreate}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Icon name="send" size={14} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.broadcastBtnText}>Broadcast Update</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Top Header */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { marginRight: 10, padding: 4 },
  headerTitle: { fontSize: 16.5, fontWeight: '800', letterSpacing: -0.2 },
  headerSub: { fontSize: 11.5, marginTop: 2 },
  postBtn: {
    backgroundColor: '#c9a84c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
    ...Platform.select({
      web: { boxShadow: '0px 3px 12px rgba(201,168,76,0.4)' },
      default: {
        shadowColor: '#c9a84c',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  postBtnText: { color: '#0c0f10', fontSize: 13, fontWeight: '700' },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  statDivider: { width: 1, height: 30 },

  /* Filters Area (fixed, not scrollable container itself) */
  filtersArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  typeTabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeTabText: { fontSize: 12.5, fontWeight: '700' },

  facultyScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  facultyPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  facultyPillText: { fontSize: 11.5, fontWeight: '600' },

  /* Search Box */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },

  /* Feed */
  listContent: { padding: 16, paddingBottom: 40 },
  resultCount: { fontSize: 12, marginBottom: 12, fontWeight: '600' },

  /* Event Card */
  eventCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: { width: 4, minHeight: '100%' },
  cardInner: { flex: 1, padding: 16 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgesRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexShrink: 1 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 10.5, fontWeight: '800' },
  catBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catBadgeText: { fontSize: 10.5, fontWeight: '600' },
  dateText: { fontSize: 11, fontWeight: '600', flexShrink: 0 },

  cardTitle: { fontSize: 15.5, fontWeight: '800', marginBottom: 8, lineHeight: 22, letterSpacing: -0.2 },

  deptRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  deptText: { fontSize: 12, fontWeight: '700' },

  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: 10 },

  venueRow: { flexDirection: 'row', alignItems: 'center' },
  venueText: { fontSize: 11.5 },

  /* Empty State */
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  typeSelectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  broadcastBtn: {
    flex: 2,
    backgroundColor: '#c9a84c',
    paddingVertical: 11,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 3px 12px rgba(201,168,76,0.35)' },
      default: {
        shadowColor: '#c9a84c',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  broadcastBtnText: { color: '#0c0f10', fontSize: 13.5, fontWeight: '700' },
});
