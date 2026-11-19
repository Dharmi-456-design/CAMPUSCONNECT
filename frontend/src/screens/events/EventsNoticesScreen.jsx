import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import {
  getEventsApi,
  getMyRegistrationsApi,
  registerForEventApi,
  cancelEventRegistrationApi,
} from '../../api/events.api';
import { getNoticesApi, deleteNoticeApi, createNoticeApi } from '../../api/notices.api';
import EventCard from './EventCard';
import EventDetailsScreen from './EventDetailsScreen';
import AdminEventModal from './AdminEventModal';

// Featured clubs matching reference screen (media_1794716870205_ba96cb1c.jpg)
const FEATURED_CLUBS = [
  {
    name: 'Games study Society',
    logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop',
    icon: 'gamepad-2',
    color: '#3B82F6',
  },
  {
    name: 'FESA',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop',
    icon: 'feather',
    color: '#EF4444',
  },
  {
    name: 'Cliff Hanging Crew',
    logo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop',
    icon: 'compass',
    color: '#F59E0B',
  },
];

const FILTER_PILLS = [
  'All',
  'Recent',
  'Food Available',
  'Limited seats',
  'Clubs and Orgs',
  'Networking',
  'Cultural',
  'Workshop',
];

// Real starter campus events for instant 0ms render
const STARTER_CAMPUS_EVENTS = [
  {
    _id: 'ev_1',
    title: 'Swaminarayan University Annual Tech Fest 2026',
    description: 'National Level Technical Symposium featuring Hackathons, Robotics, Web & Mobile App Coding Competitions, and Project Exhibitions at SSIT Campus.',
    category: 'Technology',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: 'Friday, 9:30 AM - 5:00 PM',
    venue: 'SSIT Central Auditorium & Computer Labs, Kalol',
    organizer: 'Department of Computer Science & Engineering',
    capacity: 250,
    registeredCount: 148,
    perks: ['Certificates', 'Food Available', 'Cash Prizes'],
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
    isRegistered: false,
  },
  {
    _id: 'ev_2',
    title: 'Industry Expert Session: Cloud Computing & AI Systems',
    description: 'Interactive session with Senior Solution Architects on Microservices, AWS Architecture, and Generative AI.',
    category: 'Workshop',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    time: 'Monday, 11:00 AM - 1:00 PM',
    venue: 'Seminar Hall B, Block C, Swaminarayan University',
    organizer: 'SSIT Training & Placement Cell',
    capacity: 120,
    registeredCount: 85,
    perks: ['Networking', 'Limited seats'],
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
    isRegistered: false,
  },
  {
    _id: 'ev_3',
    title: 'Ganesh Mahotsav & Cultural Youth Festival',
    description: 'University level cultural events including traditional Garba Raas, Music Night, Drama, and Photography contests.',
    category: 'Cultural',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    time: 'Wednesday, 5:30 PM Onwards',
    venue: 'Open Air Theatre, Swaminarayan University Campus',
    organizer: 'Student Cultural Committee',
    capacity: 500,
    registeredCount: 320,
    perks: ['Food Available', 'Recent'],
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
    isRegistered: false,
  },
  {
    _id: 'ev_4',
    title: 'Campus Placement Readiness & Mock Interviews',
    description: 'Technical HR and Coding round preparation for 6th and 8th semester students with senior alumni and industry mentors.',
    category: 'Networking',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    time: 'Saturday, 10:00 AM - 2:00 PM',
    venue: 'Conference Hall 1, Swaminarayan University',
    organizer: 'Training & Placement Office',
    capacity: 100,
    registeredCount: 92,
    perks: ['Free lunch!! Hiring!!', 'Networking'],
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    isRegistered: false,
  },
];

export default function EventsNoticesScreen({ onBack }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const { user } = useAuthStore();
  const { isDark } = useTheme();
  const isAdmin = user?.role === 'admin' || user?.role === 'faculty';

  // Active top tab: 'events' | 'my-events' | 'notices'
  const [activeTab, setActiveTab] = useState('events');

  // Events state — initialized with real events for 0ms load speed
  const [events, setEvents] = useState(STARTER_CAMPUS_EVENTS);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Notices state
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);

  // Notice creation modal state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('Academic');
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);
  const [createNoticeVisible, setCreateNoticeVisible] = useState(false);
  const [noticeSaving, setNoticeSaving] = useState(false);

  // Fetch all events
  const fetchEvents = useCallback(async (search = '', filter = 'All') => {
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (filter && filter !== 'All') {
        if (filter === 'Food Available' || filter === 'Limited seats' || filter === 'Recent') {
          params.perk = filter;
        } else {
          params.category = filter;
        }
      }
      const res = await getEventsApi(params);
      if (res.data?.events && res.data.events.length > 0) {
        setEvents(res.data.events);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  // Fetch my registered events
  const fetchMyEvents = useCallback(async () => {
    try {
      const res = await getMyRegistrationsApi();
      setMyEvents(res.data?.events || []);
    } catch (e) {
      // Fallback
    }
  }, []);

  // Fetch college notices
  const fetchNotices = useCallback(async (search = '') => {
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      const res = await getNoticesApi(params);
      setNotices(res.data?.notices || []);
    } catch (e) {
      // Fallback
    }
  }, []);

  const loadData = useCallback(async () => {
    // Only show full-screen spinner if we have no events to display
    if (events.length === 0) {
      setLoading(true);
    }
    await Promise.all([
      fetchEvents(searchQuery, activeFilter),
      fetchMyEvents(),
      fetchNotices(searchQuery),
    ]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchEvents, fetchMyEvents, fetchNotices, searchQuery, activeFilter, events.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Instant 1-tap registration handler
  const handleRegisterEvent = async (ev) => {
    try {
      await registerForEventApi(ev._id);
      if (Platform.OS === 'web') {
        window.alert(`🎉 Success! You are registered for ${ev.title}.`);
      } else {
        Alert.alert('Registration Confirmed', `You have booked a seat for ${ev.title}.`);
      }
      fetchEvents(searchQuery, activeFilter);
      fetchMyEvents();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Registration Error', msg);
    }
  };

  // Cancel registration handler
  const handleCancelRegistration = (ev) => {
    const doCancel = async () => {
      try {
        await cancelEventRegistrationApi(ev._id);
        fetchEvents(searchQuery, activeFilter);
        fetchMyEvents();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Cancel failed';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Cancel your seat for ${ev.title}?`)) doCancel();
    } else {
      Alert.alert('Cancel Seat', `Cancel your seat for ${ev.title}?`, [
        { text: 'Keep Seat', style: 'cancel' },
        { text: 'Cancel Seat', style: 'destructive', onPress: doCancel },
      ]);
    }
  };

  // Create notice handler for admins
  const handleCreateNotice = async () => {
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
      if (Platform.OS === 'web') window.alert('Title and content are required');
      else Alert.alert('Error', 'Title and content are required');
      return;
    }

    setNoticeSaving(true);
    try {
      await createNoticeApi({
        title: newNoticeTitle.trim(),
        content: newNoticeContent.trim(),
        category: newNoticeCategory,
        isImportant: newNoticeImportant,
      });
      setNewNoticeTitle('');
      setNewNoticeContent('');
      setCreateNoticeVisible(false);
      fetchNotices(searchQuery);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to publish notice';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setNoticeSaving(false);
    }
  };

  // If viewing single event details
  if (selectedEvent) {
    return (
      <EventDetailsScreen
        event={selectedEvent}
        onBack={() => {
          setSelectedEvent(null);
          fetchEvents(searchQuery, activeFilter);
          fetchMyEvents();
        }}
        onEdit={(ev) => {
          setEditingEvent(ev);
          setAdminModalVisible(true);
        }}
        onEventUpdated={(updatedEv, deletedId) => {
          if (deletedId) setSelectedEvent(null);
          else if (updatedEv) setSelectedEvent(updatedEv);
          fetchEvents(searchQuery, activeFilter);
          fetchMyEvents();
        }}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B0F19' : '#FFFFFF' }]}>
      {/* Top Header matching reference (media_1794716870205_ba96cb1c.jpg) */}
      <View style={[styles.header, { backgroundColor: isDark ? '#121927' : '#FFFFFF', borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
        {onBack ? (
          <TouchableOpacity style={styles.headerIconBtn} onPress={onBack}>
            <Icon name="arrow-left" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIconBtn}>
            <Icon name="menu" size={22} color={isDark ? '#F8FAFC' : '#0F172A'} />
          </View>
        )}

        <View style={styles.brandTitleRow}>
          <Text style={[styles.brandTitle, { color: '#16A36A' }]}>CampusOne</Text>
          <View style={[styles.liveDot, { backgroundColor: '#16A36A' }]} />
        </View>

        <View style={styles.headerRight}>
          {isAdmin ? (
            <TouchableOpacity
              style={styles.adminAddBtn}
              onPress={() => {
                if (activeTab === 'notices') {
                  setCreateNoticeVisible(true);
                } else {
                  setEditingEvent(null);
                  setAdminModalVisible(true);
                }
              }}
            >
              <Icon name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="bell" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Switcher Tabs */}
      <View style={[styles.segmentBar, { backgroundColor: isDark ? '#121927' : '#FFFFFF', borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
        <TouchableOpacity
          style={[styles.segmentBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }, activeTab === 'events' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('events')}
        >
          <Icon
            name="calendar"
            size={14}
            color={activeTab === 'events' ? '#FFFFFF' : '#64748B'}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.segmentText, activeTab === 'events' && styles.segmentTextActive]}>
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }, activeTab === 'my-events' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('my-events')}
        >
          <Icon
            name="user-check"
            size={14}
            color={activeTab === 'my-events' ? '#FFFFFF' : '#64748B'}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.segmentText, activeTab === 'my-events' && styles.segmentTextActive]}>
            My Events ({myEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }, activeTab === 'notices' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('notices')}
        >
          <Icon
            name="bell"
            size={14}
            color={activeTab === 'notices' ? '#FFFFFF' : '#64748B'}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.segmentText, activeTab === 'notices' && styles.segmentTextActive]}>
            Notice Board
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar matching reference rounded grey pill */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#0B0F19' : '#FFFFFF' }]}>
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Icon name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#F8FAFC' : '#0F172A' }]}
            placeholder={
              activeTab === 'notices' ? 'Search college notices...' : 'Search events, venues, clubs...'
            }
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Main Content Render */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#16A36A" />
          <Text style={[styles.loadingText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Loading campus updates...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.desktopContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#16A36A']}
            />
          }
        >
          {/* TAB 1: ALL CAMPUS EVENTS */}
          {activeTab === 'events' ? (
            <>
              {/* Featured Societies Circles matching reference screen */}
              <View style={styles.clubsSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clubsScroll}>
                  {FEATURED_CLUBS.map((club, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.clubCircleItem}
                      onPress={() => {
                        setSearchQuery(club.name);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.clubAvatarBg, { borderColor: club.color, backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                        <Icon name={club.icon} size={22} color={club.color} />
                      </View>
                      <Text style={[styles.clubName, { color: isDark ? '#94A3B8' : '#334155' }]} numberOfLines={2}>
                        {club.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Filter Pills matching reference screen */}
              <View style={styles.filtersSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                  {FILTER_PILLS.map((pill) => {
                    const isSelected = activeFilter === pill;
                    return (
                      <TouchableOpacity
                        key={pill}
                        style={[
                          styles.filterPill,
                          { backgroundColor: isSelected ? '#0F172A' : (isDark ? '#1E293B' : '#FFFFFF'), borderColor: isSelected ? '#0F172A' : (isDark ? '#334155' : '#E2E8F0') },
                          isSelected && styles.filterPillActive
                        ]}
                        onPress={() => setActiveFilter(pill)}
                      >
                        <Text style={[styles.filterPillText, { color: isSelected ? '#FFFFFF' : (isDark ? '#94A3B8' : '#475569') }, isSelected && styles.filterPillTextActive]}>
                          {pill}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Event Cards List */}
              {events.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: isDark ? '#121927' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                  <Icon name="calendar" size={36} color="#CBD5E1" />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>No events found</Text>
                  <Text style={[styles.emptySub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Try clearing your search query or switching category filters.
                  </Text>
                </View>
              ) : (
                events.map((ev) => (
                  <EventCard
                    key={ev._id}
                    event={ev}
                    onPress={() => setSelectedEvent(ev)}
                    onRegisterPress={handleRegisterEvent}
                    onCancelPress={handleCancelRegistration}
                  />
                ))
              )}
            </>
          ) : null}

          {/* TAB 2: MY REGISTERED EVENTS */}
          {activeTab === 'my-events' ? (
            <>
              <View style={styles.myEventsHeader}>
                <Text style={[styles.myEventsTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Your Registered Seats</Text>
                <Text style={[styles.myEventsSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Present your college ID and confirmed seat confirmation at the entrance.
                </Text>
              </View>

              {myEvents.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: isDark ? '#121927' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                  <Icon name="ticket" size={40} color="#CBD5E1" />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>No registered events yet</Text>
                  <Text style={[styles.emptySub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Browse upcoming campus events and reserve your seat with 1 click!
                  </Text>
                  <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => setActiveTab('events')}
                  >
                    <Text style={styles.browseBtnText}>Explore Events</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                myEvents.map((ev) => (
                  <EventCard
                    key={ev._id}
                    event={ev}
                    onPress={() => setSelectedEvent(ev)}
                    onCancelPress={handleCancelRegistration}
                  />
                ))
              )}
            </>
          ) : null}

          {/* TAB 3: COLLEGE NOTICE BOARD */}
          {activeTab === 'notices' ? (
            <>
              <View style={styles.noticeBoardHeader}>
                <View>
                  <Text style={[styles.noticeBoardTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Official Campus Notices</Text>
                  <Text style={[styles.noticeBoardSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Verified announcements from University Administration & Academic Bureau
                  </Text>
                </View>
                {isAdmin ? (
                  <TouchableOpacity
                    style={styles.publishNoticeBtn}
                    onPress={() => setCreateNoticeVisible(true)}
                  >
                    <Icon name="plus" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.publishNoticeBtnText}>Post Notice</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {notices.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: isDark ? '#121927' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                  <Icon name="bell" size={36} color="#CBD5E1" />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>No notices found</Text>
                </View>
              ) : (
                notices.map((n) => {
                  const dateStr = new Date(n.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <TouchableOpacity
                      key={n._id}
                      style={[styles.noticeCard, { backgroundColor: isDark ? '#121927' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }, n.isImportant && styles.noticeCardImportant]}
                      onPress={() => {
                        setSelectedNotice(n);
                        setNoticeModalVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.noticeTopRow}>
                        <View style={styles.noticeBadgeRow}>
                          <View
                            style={[
                              styles.noticeCatBadge,
                              n.category === 'Examination' && { backgroundColor: '#FEE2E2' },
                              n.category === 'Academic' && { backgroundColor: '#EFF6FF' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.noticeCatText,
                                n.category === 'Examination' && { color: '#DC2626' },
                                n.category === 'Academic' && { color: '#2563EB' },
                              ]}
                            >
                              {n.category}
                            </Text>
                          </View>

                          {n.isImportant ? (
                            <View style={styles.importantPill}>
                              <Icon name="alert-triangle" size={11} color="#DC2626" style={{ marginRight: 3 }} />
                              <Text style={styles.importantPillText}>Important</Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.noticeDate}>{dateStr}</Text>
                      </View>

                      <Text style={[styles.noticeTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>{n.title}</Text>
                      <Text style={[styles.noticeContentSnippet, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={2}>
                        {n.content}
                      </Text>

                      <View style={[styles.noticeFooter, { borderTopColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                        <Text style={styles.noticeDept}>Issued by: {n.department || 'Administration'}</Text>
                        <Icon name="chevron-right" size={16} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          ) : null}
        </ScrollView>
      )}

      {/* Admin Event Modal */}
      <AdminEventModal
        visible={adminModalVisible}
        onClose={() => {
          setAdminModalVisible(false);
          setEditingEvent(null);
        }}
        initialEvent={editingEvent}
        onEventSaved={() => {
          fetchEvents(searchQuery, activeFilter);
          fetchMyEvents();
        }}
      />

      {/* Notice Details Modal */}
      <Modal
        visible={noticeModalVisible && Boolean(selectedNotice)}
        transparent
        animationType="fade"
        onRequestClose={() => setNoticeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.noticeDetailCard}>
            <View style={styles.noticeModalHeader}>
              <View style={styles.noticeBadgeRow}>
                <View style={styles.noticeCatBadge}>
                  <Text style={styles.noticeCatText}>{selectedNotice?.category}</Text>
                </View>
                {selectedNotice?.isImportant ? (
                  <View style={styles.importantPill}>
                    <Text style={styles.importantPillText}>Important</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity onPress={() => setNoticeModalVisible(false)}>
                <Icon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.noticeModalTitle}>{selectedNotice?.title}</Text>
            <Text style={styles.noticeModalDate}>
              Issued on{' '}
              {new Date(selectedNotice?.createdAt || Date.now()).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>

            <ScrollView style={{ maxHeight: 280, marginVertical: 14 }}>
              <Text style={styles.noticeModalBody}>{selectedNotice?.content}</Text>
            </ScrollView>

            <View style={styles.noticeModalFooter}>
              <Text style={styles.noticeModalDept}>Department: {selectedNotice?.department}</Text>
              <TouchableOpacity
                style={styles.closeNoticeBtn}
                onPress={() => setNoticeModalVisible(false)}
              >
                <Text style={styles.closeNoticeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Post Notice Modal (Admin Only) */}
      <Modal
        visible={createNoticeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateNoticeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createNoticeCard}>
            <View style={styles.noticeModalHeader}>
              <Text style={styles.createNoticeTitle}>Publish College Notice</Text>
              <TouchableOpacity onPress={() => setCreateNoticeVisible(false)}>
                <Icon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.inputField}
              placeholder="Notice Title *"
              placeholderTextColor="#94A3B8"
              value={newNoticeTitle}
              onChangeText={setNewNoticeTitle}
            />

            <TextInput
              style={[styles.inputField, styles.textAreaField]}
              placeholder="Full announcement body & guidelines *"
              placeholderTextColor="#94A3B8"
              value={newNoticeContent}
              onChangeText={setNewNoticeContent}
              multiline
            />

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[styles.checkbox, newNoticeImportant && styles.checkboxActive]}
                onPress={() => setNewNoticeImportant(!newNoticeImportant)}
              >
                {newNoticeImportant ? <Icon name="check" size={12} color="#FFFFFF" /> : null}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Mark as Urgent / Important</Text>
            </View>

            <View style={styles.createNoticeFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCreateNoticeVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.publishBtn}
                onPress={handleCreateNotice}
                disabled={noticeSaving}
              >
                {noticeSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.publishBtnText}>Publish Notice</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#E11D48', // red/coral accent matching "highfive" logo
    letterSpacing: -0.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A36A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  segmentBtnActive: {
    backgroundColor: '#16A36A',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  clubsSection: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  clubsScroll: {
    flexDirection: 'row',
  },
  clubCircleItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  clubAvatarBg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  clubName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },
  filtersSection: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  desktopContainer: {
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  browseBtn: {
    marginTop: 14,
    backgroundColor: '#16A36A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  browseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  myEventsHeader: {
    marginBottom: 16,
  },
  myEventsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  myEventsSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  noticeBoardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noticeBoardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  noticeBoardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 420,
  },
  publishNoticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A36A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  publishNoticeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  noticeCardImportant: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  noticeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeCatBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noticeCatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  importantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  importantPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  noticeDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  noticeContentSnippet: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  noticeDept: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noticeDetailCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  noticeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 4,
  },
  noticeModalDate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  noticeModalBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  noticeModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  noticeModalDept: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  closeNoticeBtn: {
    backgroundColor: '#16A36A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeNoticeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createNoticeCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  createNoticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  textAreaField: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  createNoticeFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  publishBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#16A36A',
  },
  publishBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
