import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/Loader';
import Icon from '../components/common/Icon';
import usePushNotifications from '../hooks/usePushNotifications';
import axiosClient from '../api/axiosClient';

// Screens
import SplitAuthScreen from '../screens/auth/SplitAuthScreen';
import HomeScreen from '../screens/HomeScreen';
import AcademicsScreen from '../screens/AcademicsScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import NotesScreen from '../screens/NotesScreen';
import DoubtsScreen from '../screens/DoubtsScreen';
import TeamScreen from '../screens/TeamScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EventsNoticesScreen from '../screens/events/EventsNoticesScreen';
import UniversitySubscriptionScreen from '../screens/admin/UniversitySubscriptionScreen';
import CameraScreen from '../screens/hardware/CameraScreen';
import LocationScreen from '../screens/hardware/LocationScreen';
import ContactsScreen from '../screens/hardware/ContactsScreen';

const SIDEBAR_ITEMS = [
  { key: 'home', label: 'Dashboard', icon: 'grid' },
  { key: 'academics', label: 'Academics & KHS', icon: 'book-open' },
  { key: 'events', label: 'Events & Notices', icon: 'calendar' },
  { key: 'community', label: 'Community & Doubts', icon: 'users' },
  { key: 'notes', label: 'Lecture Notes', icon: 'file-text' },
  { key: 'marketplace', label: 'Campus Market', icon: 'shopping-bag' },
  { key: 'explore', label: 'Campus Services', icon: 'briefcase' },
  { key: 'profile', label: 'Settings & Profile', icon: 'settings' },
];

const MOBILE_TABS = [
  { key: 'home', label: 'Home', icon: 'grid' },
  { key: 'academics', label: 'Academics', icon: 'book-open' },
  { key: 'events', label: 'Events', icon: 'calendar' },
  { key: 'community', label: 'Community', icon: 'users' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

const AI_PROMPTS = [
  'When are mid-sem exams?',
  'Show me SIH hackathon squads',
  'Where can I find ADA notes?',
  'How do I contact campus TAs?',
];

export default function AppNavigator() {
  const { user, isAuthenticated, isLoading, loadStoredAuth, logout } = useAuthStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 960;
  const isMobile = width < 640;

  const [authFlow, setAuthFlow] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [globalSearch, setGlobalSearch] = useState('');

  // Notifications Drawer state — loaded from real API
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Push notifications hook — registers device & handles taps
  usePushNotifications(setActiveTab);

  // Fetch real notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axiosClient.get('/notifications');
      const { notifications, unreadCount: count } = res.data?.data || {};
      if (notifications) {
        // Map to UI shape with icons/colors per type
        const mapped = notifications.map((n) => ({
          id: n._id,
          title: n.message?.split(' ').slice(0, 5).join(' ') + (n.message?.split(' ').length > 5 ? '...' : ''),
          body: n.message,
          time: formatRelativeTime(n.createdAt),
          unread: !n.isRead,
          tab: typeToTab(n.type),
          icon: typeToIcon(n.type),
          color: typeToColor(n.type),
          rawId: n._id,
        }));
        setNotifList(mapped);
        setUnreadCount(count || 0);
      }
    } catch (err) {
      // Fail silently — don't break the UI
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Refresh notifications every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);


  const [botVisible, setBotVisible] = useState(false);
  const [botQuery, setBotQuery] = useState('');
  const [botMessages, setBotMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! 👋 I am CampusBot, your AI Assistant. How can I help you today?',
    },
  ]);

  if (isLoading) return <Loader message="Starting CampusConnect..." />;

  // Unauthenticated Flow: Directly shows Login / Signup
  if (!isAuthenticated) {
    return <SplitAuthScreen initialMode={authFlow} />;
  }

  const isAdmin = user?.role === 'admin';
  const sidebarNavList = isAdmin
    ? [...SIDEBAR_ITEMS, { key: 'admin', label: 'Admin Panel', icon: 'shield' }]
    : SIDEBAR_ITEMS;

  const mobileNavList = isAdmin
    ? [...MOBILE_TABS.slice(0, 4), { key: 'admin', label: 'Admin', icon: 'shield' }]
    : MOBILE_TABS;

  const userName = user?.name || 'Dharmi Patel';
  const firstName = userName.split(' ')[0];
  const userDept = user?.branch || 'Computer Engg.';
  const userSem = user?.semester || 3;

  const markAllRead = async () => {
    try {
      await axiosClient.patch('/notifications/read-all');
      setNotifList((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch {
      // Optimistic update even if API fails
      setNotifList((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
    }
  };

  const handleNotifClick = async (tab, rawId) => {
    setActiveTab(tab);
    setNotifVisible(false);
    // Mark individual notification as read
    if (rawId) {
      try {
        await axiosClient.patch(`/notifications/${rawId}/read`);
        setNotifList((prev) =>
          prev.map((n) => (n.rawId === rawId ? { ...n, unread: false } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
  };

  const handleSendBotQuery = (textToSend) => {
    const q = textToSend || botQuery;
    if (!q || !q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    let replyText = 'I found that information for you on CampusOne!';

    const lower = q.toLowerCase();
    if (lower.includes('exam') || lower.includes('mid-sem')) {
      replyText = '📅 Mid-Semester Exams start on 10th November 2026. Make sure to download your hall ticket from the Events portal!';
    } else if (lower.includes('sih') || lower.includes('hackathon') || lower.includes('squad')) {
      replyText = '🚀 We have 2 active squads looking for leads: SIH 2026 AI Squad (React Native/ML) & Smart Gujarat Crop Diagnostic App!';
    } else if (lower.includes('note') || lower.includes('ada')) {
      replyText = '📚 ADA Complete Handwritten Notes & Solved PYQs are uploaded in Notes Hub by Prof. Harsh Patel!';
    } else if (lower.includes('ta') || lower.includes('contact')) {
      replyText = '👤 You can view TA directory and peer contacts in Campus Directory inside Tasks & Hub!';
    } else {
      replyText = `🤖 Got it! Searching campus records for "${q}"... Check the respective portal tab for complete details.`;
    }

    setBotMessages((prev) => [...prev, userMsg, { sender: 'bot', text: replyText }]);
    setBotQuery('');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateTab={setActiveTab} />;
      case 'academics':
        return <AcademicsScreen onNavigateTab={setActiveTab} />;
      case 'events':
        return <EventsNoticesScreen onBack={() => setActiveTab('home')} />;
      case 'community':
        return <DoubtsScreen onNavigateTab={setActiveTab} />;
      case 'explore':
        return <ExploreScreen onNavigateTab={setActiveTab} />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'subscription':
        return <UniversitySubscriptionScreen onBack={() => setActiveTab('explore')} />;
      case 'notes':
        return <NotesScreen />;
      case 'doubts':
        return <DoubtsScreen />;
      case 'team':
        return <TeamScreen />;
      case 'marketplace':
        return <MarketplaceScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return <AdminDashboardScreen />;
      case 'camera':
        return <CameraScreen onBack={() => setActiveTab('explore')} />;
      case 'location':
        return <LocationScreen onBack={() => setActiveTab('explore')} />;
      case 'contacts':
        return <ContactsScreen onBack={() => setActiveTab('explore')} />;
      default:
        return <HomeScreen onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (Visible on width >= 960)                 */}
      {/* ======================================================== */}
      {isDesktop && (
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
              borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
        >
          {/* Brand Logo */}
          <TouchableOpacity
            style={styles.sidebarHeader}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.85}
          >
            <View style={styles.logoBadge}>
              <Icon name="zap" size={16} color="#FFF" />
            </View>
            <Text style={[styles.logoText, { color: theme.textPrimary }]}>
              Campus<Text style={{ color: '#16A36A' }}>One</Text>
            </Text>
          </TouchableOpacity>

          {/* Navigation Links */}
          <ScrollView style={styles.sidebarNav} showsVerticalScrollIndicator={false}>
            {sidebarNavList.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.navItem,
                    isActive && {
                      backgroundColor: isDark ? 'rgba(22, 163, 106, 0.18)' : '#E8F5EE',
                      borderColor: '#16A36A',
                      borderWidth: 1,
                      shadowColor: '#16A36A',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setActiveTab(item.key)}
                  activeOpacity={0.75}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    color={isActive ? '#16A36A' : isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.navItemLabel,
                      { color: isActive ? '#16A36A' : isDark ? '#94A3B8' : '#64748B' },
                      isActive && { fontWeight: '700' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Promo Box */}
          <View
            style={[
              styles.sidebarPromoCard,
              {
                backgroundColor: isDark ? 'rgba(22, 163, 106, 0.12)' : '#E8F5EE',
                borderColor: isDark ? 'rgba(22, 163, 106, 0.25)' : '#DCFCE7',
              },
            ]}
          >
            <View
              style={[
                styles.promoIcon,
                { backgroundColor: isDark ? 'rgba(22, 163, 106, 0.25)' : '#DCFCE7' },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🚀</Text>
            </View>
            <Text style={[styles.promoTitle, { color: isDark ? '#FFF' : '#1E1B4B' }]}>
              Build. Collaborate. Create Impact.
            </Text>
            <TouchableOpacity
              style={styles.promoBtn}
              onPress={() => setActiveTab('explore')}
              activeOpacity={0.85}
            >
              <Text style={styles.promoBtnText}>Explore More →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* MAIN VIEWPORT (Top Header + Active Screen View)          */}
      {/* ======================================================== */}
      <View style={styles.mainViewport}>
        {/* TOP HEADER */}
        <View
          style={[
            isDesktop ? styles.topHeader : styles.topHeaderMobile,
            {
              backgroundColor: isDark ? 'rgba(8, 12, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
        >
          {isDesktop ? (
            <>
              {/* Global Search Bar */}
              <View
                style={[
                  styles.searchWrap,
                  {
                    backgroundColor: isDark ? '#121927' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <Icon name="search" size={15} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.searchInput, { color: theme.textPrimary }]}
                  placeholder="Search notes, doubts, teams, events..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={globalSearch}
                  onChangeText={setGlobalSearch}
                />
                <View style={[styles.kbdBadge, { backgroundColor: isDark ? '#1C2536' : '#E2E8F0' }]}>
                  <Text style={[styles.kbdText, { color: isDark ? '#94A3B8' : '#64748B' }]}>⌘K</Text>
                </View>
              </View>

              {/* Top Right Actions */}
              <View style={styles.topRightWrap}>
                {/* Notification Bell */}
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: isDark ? '#121927' : '#F1F5F9',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                    },
                  ]}
                  onPress={() => setNotifVisible(!notifVisible)}
                  activeOpacity={0.8}
                >
                  <Icon name="bell" size={16} color={isDark ? '#E2E8F0' : '#475569'} />
                  {unreadCount > 0 && (
                    <View style={styles.bellBadge}>
                      <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Theme Toggle */}
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: isDark ? '#121927' : '#F1F5F9',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                    },
                  ]}
                  onPress={toggleTheme}
                  activeOpacity={0.8}
                >
                  <Icon name={isDark ? 'sun' : 'moon'} size={16} color={isDark ? '#E2E8F0' : '#475569'} />
                </TouchableOpacity>

                {/* User Profile Pill */}
                <TouchableOpacity
                  style={[
                    styles.userPill,
                    {
                      backgroundColor: isDark ? '#121927' : '#F1F5F9',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                    },
                  ]}
                  onPress={() => setActiveTab('profile')}
                  activeOpacity={0.8}
                >
                  <View style={styles.userAvatar}>
                    {user?.photoUrl ? (
                      <Image source={{ uri: user.photoUrl }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={styles.userInfoCol}>
                    <Text style={[styles.userName, { color: theme.textPrimary }]}>{userName}</Text>
                    <Text style={[styles.userSub, { color: theme.textMuted }]}>
                      {userDept} • Sem {userSem}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={14} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.mobileHeaderCol}>
              {/* Top Row: Brand & Action Icons */}
              <View style={styles.mobileTopBarRow}>
                <TouchableOpacity
                  style={styles.mobileBrand}
                  onPress={() => setActiveTab('home')}
                  activeOpacity={0.85}
                >
                  <View style={styles.logoBadgeSmall}>
                    <Icon name="zap" size={13} color="#FFF" />
                  </View>
                  <Text style={[styles.logoTextMobile, { color: theme.textPrimary }]}>
                    Campus<Text style={{ color: '#16A36A' }}>One</Text>
                  </Text>
                </TouchableOpacity>

                <View style={styles.mobileActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.iconBtnMobile,
                      {
                        backgroundColor: isDark ? '#121927' : '#F1F5F9',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                    onPress={() => setNotifVisible(!notifVisible)}
                    activeOpacity={0.8}
                  >
                    <Icon name="bell" size={15} color={isDark ? '#E2E8F0' : '#475569'} />
                    {unreadCount > 0 && (
                      <View style={styles.bellBadge}>
                        <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.iconBtnMobile,
                      {
                        backgroundColor: isDark ? '#121927' : '#F1F5F9',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                    onPress={toggleTheme}
                    activeOpacity={0.8}
                  >
                    <Icon name={isDark ? 'sun' : 'moon'} size={15} color={isDark ? '#E2E8F0' : '#475569'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.mobileUserAvatarBtn}
                    onPress={() => setActiveTab('profile')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.userAvatar}>
                      {user?.photoUrl ? (
                        <Image source={{ uri: user.photoUrl }} style={styles.avatarImg} />
                      ) : (
                        <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Row: Full Width Search Input */}
              <View
                style={[
                  styles.mobileSearchWrap,
                  {
                    backgroundColor: isDark ? '#121927' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <Icon name="search" size={14} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.mobileSearchInput, { color: theme.textPrimary }]}
                  placeholder="Search notes, doubts, marketplace..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={globalSearch}
                  onChangeText={setGlobalSearch}
                />
              </View>
            </View>
          )}
        </View>

        {/* SCREEN CONTENT */}
        <View style={[styles.screenContentArea, !isDesktop && styles.screenWithBottomTab]}>
          {renderScreen()}
        </View>

        {/* ======================================================== */}
        {/* MOBILE BOTTOM TAB BAR (Visible on width < 960)           */}
        {/* ======================================================== */}
        {!isDesktop && (
          <View
            style={[
              styles.mobileTabBar,
              {
                backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.mobileTabBarInner}>
              {mobileNavList.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.mobileTabItem,
                      isActive && {
                        backgroundColor: isDark ? 'rgba(22, 163, 106, 0.18)' : '#E8F5EE',
                      },
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.75}
                  >
                    <Icon
                      name={tab.icon}
                      size={isMobile ? 18 : 17}
                      color={isActive ? '#16A36A' : isDark ? '#64748B' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.mobileTabLabel,
                        { color: isActive ? '#16A36A' : isDark ? '#64748B' : '#94A3B8' },
                        isActive && { fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 🔔 NOTIFICATION SLIDE-OUT PANEL POPUP                    */}
      {/* ======================================================== */}
      {notifVisible && (
        <View
          style={[
            styles.notifPanel,
            isDesktop
              ? { top: 65, right: 20, width: 340 }
              : { top: 96, right: 12, left: 12, width: 'auto' },
            {
              backgroundColor: isDark ? '#101726' : '#FFFFFF',
              borderColor: isDark ? 'rgba(201, 168, 76, 0.3)' : '#e4dfd4',
            },
          ]}
        >
          <View style={styles.notifHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="bell" size={16} color="#16A36A" style={{ marginRight: 6 }} />
              <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>
                Campus Notifications
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.markReadText}>Mark all read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNotifVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {notifList.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                <Icon name="bell-off" size={28} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, marginTop: 8, fontSize: 13 }}>No notifications yet</Text>
              </View>
            ) : (
              notifList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifItem,
                    { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                    item.unread && { backgroundColor: isDark ? 'rgba(201, 168, 76, 0.08)' : '#E8F5EE' },
                  ]}
                  onPress={() => handleNotifClick(item.tab, item.rawId)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.notifIconCircle, { backgroundColor: `${item.color}22` }]}>
                    <Icon name={item.icon} size={14} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifItemTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.notifItemBody, { color: theme.textMuted }]}>{item.body}</Text>
                    <Text style={[styles.notifItemTime, { color: theme.textMuted }]}>{item.time}</Text>
                  </View>
                  {item.unread && <View style={styles.notifUnreadDot} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* ======================================================== */}
      {/* 🤖 FLOATING AI ASSISTANT BUTTON & CHAT WINDOW            */}
      {/* ======================================================== */}
      <TouchableOpacity
        style={[styles.floatingBotBtn, { bottom: isDesktop ? 24 : 76 }]}
        onPress={() => setBotVisible(!botVisible)}
        activeOpacity={0.85}
      >
        <Icon name="bot" size={18} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={styles.floatingBotText}>Ask CampusBot 🤖</Text>
      </TouchableOpacity>

      {botVisible && (
        <View
          style={[
            styles.botWindow,
            {
              bottom: isDesktop ? 78 : 130,
              backgroundColor: isDark ? '#101726' : '#FFFFFF',
              borderColor: isDark ? 'rgba(201, 168, 76, 0.3)' : '#e4dfd4',
            },
          ]}
        >
          <View style={styles.botHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.botAvatarCircle}>
                <Icon name="bot" size={15} color="#FFF" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.botHeaderTitle, { color: theme.textPrimary }]}>CampusBot AI</Text>
                <Text style={[styles.botHeaderSub, { color: theme.textMuted }]}>Instant Campus Helper</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setBotVisible(false)}>
              <Icon name="x" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.botMsgList} showsVerticalScrollIndicator={false}>
            {botMessages.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.botMsgBubble,
                  m.sender === 'user'
                    ? { backgroundColor: '#16A36A', alignSelf: 'flex-end' }
                    : { backgroundColor: isDark ? '#141D2D' : '#F1F5F9', alignSelf: 'flex-start' },
                ]}
              >
                <Text style={{ color: m.sender === 'user' ? '#FFFFFF' : theme.textPrimary, fontSize: 12.5, lineHeight: 18, fontWeight: m.sender === 'user' ? '600' : '400' }}>
                  {m.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Quick Prompts */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsRow}>
            {AI_PROMPTS.map((p, pi) => (
              <TouchableOpacity
                key={pi}
                style={[styles.promptPill, { backgroundColor: isDark ? '#141D2D' : '#F1F5F9', borderColor: theme.border }]}
                onPress={() => handleSendBotQuery(p)}
              >
                <Text style={{ color: '#16A36A', fontSize: 10.5, fontWeight: '600' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.botInputRow}>
            <TextInput
              style={[styles.botInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Ask anything about campus..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={botQuery}
              onChangeText={setBotQuery}
              onSubmitEditing={() => handleSendBotQuery()}
            />
            <TouchableOpacity style={styles.botSendBtn} onPress={() => handleSendBotQuery()}>
              <Icon name="send" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  /* Sidebar */
  sidebar: {
    width: 230,
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sidebarNav: {
    flex: 1,
    marginBottom: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9.5,
    borderRadius: 10,
    marginBottom: 3,
  },
  navItemLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 11,
  },
  sidebarPromoCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  promoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  promoBtn: {
    backgroundColor: '#16A36A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  promoBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Main Viewport */
  mainViewport: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  /* Top Header */
  topHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 5,
  },
  topHeaderMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    zIndex: 5,
  },
  mobileHeaderCol: {
    width: '100%',
  },
  mobileTopBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mobileActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtnMobile: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mobileUserAvatarBtn: {
    padding: 2,
    borderRadius: 16,
  },
  mobileSearchWrap: {
    width: '100%',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  mobileSearchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  logoTextMobile: {
    fontSize: 16,
    fontWeight: '800',
  },
  searchWrap: {
    flex: 1,
    maxWidth: 420,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  kbdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  kbdText: {
    fontSize: 10,
    fontWeight: '700',
  },
  topRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  userInfoCol: { marginLeft: 8 },
  userName: { fontSize: 12, fontWeight: '700' },
  userSub: { fontSize: 10 },

  /* Screen Content */
  screenContentArea: {
    flex: 1,
    overflow: 'hidden',
  },
  screenWithBottomTab: {
    marginBottom: 64,
  },

  /* Mobile Bottom Tab Bar */
  mobileTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    zIndex: 10,
  },
  mobileTabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  mobileTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  mobileTabLabel: {
    fontSize: 10.5,
    marginTop: 3,
    fontWeight: '600',
  },

  /* Notifications Panel */
  notifPanel: {
    position: 'absolute',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 6,
  },
  notifTitle: { fontSize: 13.5, fontWeight: '800' },
  markReadText: { color: '#16A36A', fontSize: 11, fontWeight: '600' },
  notifItem: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 10,
    borderBottomWidth: 1,
  },
  notifIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifItemTitle: { fontSize: 12, fontWeight: '700' },
  notifItemBody: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  notifItemTime: { fontSize: 9.5, marginTop: 3 },

  /* Floating Bot Button */
  floatingBotBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 30,
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 90,
  },
  floatingBotText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  /* Bot Chat Window */
  botWindow: {
    position: 'absolute',
    bottom: 78,
    right: 24,
    width: 330,
    height: 420,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    zIndex: 95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  botAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botHeaderTitle: { fontSize: 13.5, fontWeight: '800' },
  botHeaderSub: { fontSize: 10 },
  botMsgList: { flex: 1, paddingVertical: 10 },
  botMsgBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  promptsRow: { flexDirection: 'row', gap: 6, paddingVertical: 6 },
  promptPill: { paddingHorizontal: 10, paddingVertical: 4.5, borderRadius: 12, borderWidth: 1 },
  botInputRow: { flexDirection: 'row', gap: 6, paddingTop: 6 },
  botInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12 },
  botSendBtn: { backgroundColor: '#16A36A', width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A36A',
    marginLeft: 6,
    alignSelf: 'center',
  },
});

// ── Helper utilities ─────────────────────────────────────────────────────────

/** Format ISO date to relative time string (e.g. "2m ago", "3h ago") */
function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Map DB notification type → app tab key */
function typeToTab(type) {
  switch (type) {
    case 'doubt_answer':
    case 'new_doubt': return 'doubts';
    case 'note_approval':
    case 'note_upload': return 'notes';
    case 'team_request':
    case 'new_team': return 'team';
    case 'chat_message': return 'chat';
    case 'new_event': return 'events';
    default: return 'home';
  }
}

/** Map DB notification type → feather icon name */
function typeToIcon(type) {
  switch (type) {
    case 'doubt_answer':
    case 'new_doubt': return 'help-circle';
    case 'note_approval':
    case 'note_upload': return 'book-open';
    case 'team_request':
    case 'new_team': return 'users';
    case 'chat_message': return 'message-square';
    case 'new_event': return 'calendar';
    default: return 'bell';
  }
}

/** Map DB notification type → accent color */
function typeToColor(type) {
  switch (type) {
    case 'doubt_answer':
    case 'new_doubt': return '#06B6D4';
    case 'note_approval':
    case 'note_upload': return '#16A36A';
    case 'team_request':
    case 'new_team': return '#10B981';
    case 'chat_message': return '#8B5CF6';
    case 'new_event': return '#F59E0B';
    default: return '#16A36A';
  }
}

