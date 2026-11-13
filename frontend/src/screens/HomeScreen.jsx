import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';

const SCHEDULE_ITEMS = [
  { time: '09:00 AM – 10:00 AM', title: 'Data Structures Lecture', room: 'Room 302', type: 'Lecture', color: '#8B5CF6', status: 'Completed' },
  { time: '11:15 AM – 12:15 PM', title: 'Mathematics Tutorial', room: 'Room 204', type: 'Tutorial', color: '#06B6D4', status: 'Completed' },
  { time: '02:00 PM – 03:00 PM', title: 'Web Technology Lab', room: 'Lab 1', type: 'Lab', color: '#F59E0B', status: 'Upcoming' },
  { time: '04:30 PM – 05:30 PM', title: 'Coding Club Meetup', room: 'Seminar Hall', type: 'Club', color: '#10B981', status: 'Upcoming' },
];

const QUICK_ACTIONS = [
  { id: 'notes', label: 'Add Note', icon: 'edit-3', color: '#10B981', bg: 'rgba(16,185,129,0.15)', tab: 'notes' },
  { id: 'doubt', label: 'Ask Doubt', icon: 'help-circle', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', tab: 'doubts' },
  { id: 'market', label: 'Marketplace', icon: 'shopping-bag', color: '#f0d074', bg: 'rgba(201,168,76,0.15)', tab: 'marketplace' },
  { id: 'team', label: 'Find Squad', icon: 'users', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', tab: 'team' },
  { id: 'event', label: 'Events', icon: 'calendar', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', tab: 'events' },
  { id: 'services', label: 'Services', icon: 'grid', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', tab: 'explore' },
];

const CAMPUS_NOTICES = [
  {
    id: 1,
    tag: 'EXAMS',
    tagColor: '#EF4444',
    title: 'Mid-Sem Exam Timetable Released',
    sub: 'Hall tickets available on portal. Exams commence from 10th Nov.',
    time: '2h ago',
  },
  {
    id: 2,
    tag: 'HACKATHON',
    tagColor: '#10B981',
    title: 'Smart India Hackathon 2026',
    sub: 'College round screening proposals due by this Friday 5:00 PM.',
    time: '5h ago',
  },
  {
    id: 3,
    tag: 'LIBRARY',
    tagColor: '#c9a84c',
    title: 'Central Library 24x7 Access',
    sub: 'Silent reading wings open round the clock during preparatory week.',
    time: '1d ago',
  },
];

const UPCOMING_EVENTS = [
  { id: 1, month: 'NOV', day: '16', title: 'Campus CodeFest 2026', sub: 'Algorithm & Web Sprint', location: '10:00 AM • Main Auditorium', registered: false },
  { id: 2, month: 'NOV', day: '20', title: 'Generative AI Workshop', sub: 'LLM & Mobile Integration', location: '02:00 PM • Computer Lab 3', registered: true },
];

const CAMPUS_SERVICES = [
  { id: 'library', label: 'Library Portal', icon: 'book-open' },
  { id: 'exam', label: 'Exam Cell', icon: 'file-text' },
  { id: 'placement', label: 'Placement Cell', icon: 'award' },
  { id: 'transport', label: 'Transport Bus', icon: 'truck' },
  { id: 'grievance', label: 'Grievance', icon: 'shield' },
  { id: 'more', label: 'More Services', icon: 'grid' },
];

const DAYS_OF_WEEK = [
  { label: 'M', active: true },
  { label: 'T', active: true },
  { label: 'W', active: true },
  { label: 'T', active: true },
  { label: 'F', active: true },
  { label: 'S', active: false },
  { label: 'S', active: false },
];

const METRICS = [
  {
    label: 'Semester Attendance',
    value: '88.4%',
    sub: 'SSIT Computer Engg.',
    trend: '✓ On Track (Min 75%)',
    trendColor: '#34D399',
    trendBg: 'rgba(16,185,129,0.15)',
    icon: 'check-circle',
    iconColor: '#34D399',
    iconBg: 'rgba(16,185,129,0.18)',
  },
  {
    label: 'Pending Tasks',
    value: '3',
    sub: 'Assignments & Labs',
    trend: '⏰ 1 Due Today',
    trendColor: '#FBBF24',
    trendBg: 'rgba(245,158,11,0.15)',
    icon: 'check-square',
    iconColor: '#FBBF24',
    iconBg: 'rgba(245,158,11,0.18)',
  },
  {
    label: 'Campus Credits',
    value: '140 pts',
    sub: 'Academic & Peer Points',
    trend: '▲ Top 10% on Campus',
    trendColor: '#f0d074',
    trendBg: 'rgba(201,168,76,0.15)',
    icon: 'award',
    iconColor: '#f0d074',
    iconBg: 'rgba(201,168,76,0.18)',
  },
  {
    label: 'Study Streak',
    value: '7 Days 🔥',
    sub: 'Continuous Activity',
    trend: '📈 Weekly Personal Best',
    trendColor: '#22D3EE',
    trendBg: 'rgba(6,182,212,0.15)',
    icon: 'zap',
    iconColor: '#22D3EE',
    iconBg: 'rgba(6,182,212,0.18)',
  },
];

export default function HomeScreen({ onNavigateTab }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [registeredEvents, setRegisteredEvents] = useState({ 2: true });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const toggleRegister = (id) => setRegisteredEvents((p) => ({ ...p, [id]: !p[id] }));

  const firstName = (user?.name || 'Dharmi').split(' ')[0];
  const bgCard = theme.bgCard;
  const border = theme.border;
  const textTitle = theme.textPrimary;
  const textSub = theme.textMuted;

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* ── 1. WELCOME HERO BANNER ── */}
        <View style={[styles.heroCard, { backgroundColor: bgCard, borderColor: border }]}>
          <View style={styles.heroMain}>
            <View style={styles.heroBadgeRow}>
              <View style={[styles.heroBadge, { backgroundColor: isDark ? 'rgba(201,168,76,0.16)' : '#fdf8e8', borderColor: '#c9a84c' }]}>
                <Icon name="award" size={12} color={isDark ? '#f0d074' : '#b8943e'} style={{ marginRight: 5 }} />
                <Text style={[styles.heroBadgeText, { color: isDark ? '#f0d074' : '#b8943e' }]}>Swaminarayan University • SSIT</Text>
              </View>
              <Text style={[styles.heroDate, { color: textSub }]}>{todayDateFormatted}</Text>
            </View>

            <Text style={[styles.heroTitle, { color: textTitle }]}>
              {greetingTime}, {firstName}! 👋
            </Text>

            <Text style={[styles.heroSubtitle, { color: textSub }]}>
              Here is your campus pulse for today. You have <Text style={{ color: textTitle, fontWeight: '700' }}>2 upcoming sessions</Text> and <Text style={{ color: '#FBBF24', fontWeight: '700' }}>1 assignment due</Text>.
            </Text>

            {/* Quick Action Pills */}
            <View style={styles.heroActionBtns}>
              <TouchableOpacity
                style={[styles.heroPrimaryBtn, { backgroundColor: '#c9a84c' }]}
                onPress={() => onNavigateTab('notes')}
                activeOpacity={0.8}
              >
                <Icon name="book-open" size={14} color="#0c0f10" style={{ marginRight: 6 }} />
                <Text style={styles.heroPrimaryBtnText}>Browse Notes & PYQs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroSecondaryBtn, { borderColor: border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }]}
                onPress={() => onNavigateTab('doubts')}
                activeOpacity={0.8}
              >
                <Icon name="help-circle" size={14} color={textTitle} style={{ marginRight: 6 }} />
                <Text style={[styles.heroSecondaryBtnText, { color: textTitle }]}>Ask a Doubt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroSecondaryBtn, { borderColor: border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }]}
                onPress={() => onNavigateTab('marketplace')}
                activeOpacity={0.8}
              >
                <Icon name="shopping-bag" size={14} color={textTitle} style={{ marginRight: 6 }} />
                <Text style={[styles.heroSecondaryBtnText, { color: textTitle }]}>Marketplace</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── 2. METRICS CARDS (ATTENDANCE, TASKS, CREDITS, STREAK) ── */}
        <View style={styles.metricsGrid}>
          {METRICS.map((m, i) => (
            <View key={i} style={[styles.metricCard, { backgroundColor: bgCard, borderColor: border }]}>
              <View style={styles.metricTopRow}>
                <Text style={[styles.metricLabel, { color: textSub }]}>{m.label}</Text>
                <View style={[styles.metricIconCircle, { backgroundColor: m.iconBg }]}>
                  <Icon name={m.icon} size={15} color={m.iconColor} />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: textTitle }]}>{m.value}</Text>
              <Text style={[styles.metricSub, { color: textSub }]}>{m.sub}</Text>
              <View style={[styles.metricTrendPill, { backgroundColor: m.trendBg }]}>
                <Text style={{ color: m.trendColor, fontSize: 11, fontWeight: '700' }}>{m.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── 3. QUICK ACTIONS ROW ── */}
        <View style={[styles.card, { backgroundColor: bgCard, borderColor: border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Icon name="zap" size={15} color="#c9a84c" style={{ marginRight: 7 }} />
              <Text style={[styles.cardTitle, { color: textTitle }]}>Quick Actions</Text>
            </View>
            <Text style={[styles.cardSub, { color: textSub }]}>Frequently accessed tools</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.actionBtn, { backgroundColor: isDark ? '#121927' : '#F8FAFC', borderColor: border }]}
                onPress={() => onNavigateTab(a.tab)}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: a.bg }]}>
                  <Icon name={a.icon} size={18} color={a.color} />
                </View>
                <Text style={[styles.actionLabel, { color: textTitle }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 4. TWO-COLUMN SPLIT (SCHEDULE + CAMPUS SERVICES & ANNOUNCEMENTS) ── */}
        <View style={[styles.splitGrid, isDesktop && styles.splitGridRow]}>
          {/* LEFT COLUMN: Academic Schedule Overview */}
          <View style={[styles.leftCol, isDesktop && styles.leftColDesktop]}>
            {/* Today's Schedule Card */}
            <View style={[styles.card, { backgroundColor: bgCard, borderColor: border }]}>
              <View style={styles.cardHeaderBetween}>
                <View style={styles.cardTitleRow}>
                  <Icon name="calendar" size={15} color="#c9a84c" style={{ marginRight: 7 }} />
                  <Text style={[styles.cardTitle, { color: textTitle }]}>Today's Schedule</Text>
                </View>
                <TouchableOpacity onPress={() => onNavigateTab('events')}>
                  <Text style={styles.linkText}>View Full Calendar →</Text>
                </TouchableOpacity>
              </View>

              {/* Next Up Highlight Card */}
              <View style={[styles.nextUpCard, { backgroundColor: isDark ? 'rgba(201,168,76,0.12)' : '#fdf8e8', borderColor: '#c9a84c' }]}>
                <View style={styles.nextUpHeader}>
                  <View style={styles.statusLiveBadge}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.statusLiveText}>NEXT UP TODAY</Text>
                  </View>
                  <Text style={[styles.nextUpTime, { color: isDark ? '#f0d074' : '#b8943e' }]}>02:00 PM – 03:00 PM</Text>
                </View>
                <Text style={[styles.nextUpTitle, { color: textTitle }]}>Web Technology Lab</Text>
                <View style={styles.nextUpMetaRow}>
                  <Text style={[styles.nextUpMeta, { color: textSub }]}>📍 Computer Lab 1 • Prof. H. Patel</Text>
                  <View style={[styles.typeBadge, { backgroundColor: isDark ? '#1c2536' : '#E2E8F0' }]}>
                    <Text style={[styles.typeBadgeText, { color: textTitle }]}>Practical Lab</Text>
                  </View>
                </View>
              </View>

              {/* Timeline List */}
              <View style={styles.timelineList}>
                {SCHEDULE_ITEMS.map((item, idx) => {
                  const isDone = item.status === 'Completed';
                  return (
                    <View key={idx} style={styles.timelineItem}>
                      <View style={styles.timelineLine}>
                        <View style={[styles.tDot, { backgroundColor: isDone ? '#10B981' : item.color }]} />
                        {idx < SCHEDULE_ITEMS.length - 1 && (
                          <View style={[styles.tLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} />
                        )}
                      </View>
                      <View style={styles.timelineInfo}>
                        <View style={styles.timelineTimeRow}>
                          <Text style={[styles.tTime, { color: item.color }]}>{item.time}</Text>
                          {isDone && <Text style={styles.completedTag}>Completed ✓</Text>}
                        </View>
                        <Text style={[styles.tTitle, { color: textTitle }]}>{item.title}</Text>
                        <Text style={[styles.tRoom, { color: textSub }]}>{item.room}</Text>
                      </View>
                      <View style={[styles.tBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                        <Text style={[styles.tBadgeText, { color: isDark ? '#CBD5E1' : '#475569' }]}>{item.type}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Explore Campus Services */}
            <View style={[styles.card, { backgroundColor: bgCard, borderColor: border }]}>
              <View style={styles.cardTitleRow}>
                <Icon name="compass" size={15} color="#c9a84c" style={{ marginRight: 7 }} />
                <Text style={[styles.cardTitle, { color: textTitle }]}>Campus Services</Text>
              </View>
              <View style={styles.servicesGrid}>
                {CAMPUS_SERVICES.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.serviceBtn, { backgroundColor: isDark ? '#121927' : '#F8FAFC', borderColor: border }]}
                    onPress={() => onNavigateTab('explore')}
                    activeOpacity={0.75}
                  >
                    <Icon name={s.icon} size={15} color="#c9a84c" style={{ marginRight: 8 }} />
                    <Text style={[styles.serviceBtnText, { color: textTitle }]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* RIGHT COLUMN: Announcements, Streak & Events */}
          <View style={styles.rightCol}>
            {/* Campus Notices & Bulletins */}
            <View style={[styles.card, { backgroundColor: bgCard, borderColor: border }]}>
              <View style={styles.cardHeaderBetween}>
                <View style={styles.cardTitleRow}>
                  <Icon name="bell" size={15} color="#c9a84c" style={{ marginRight: 7 }} />
                  <Text style={[styles.cardTitle, { color: textTitle }]}>Campus Notices</Text>
                </View>
                <TouchableOpacity onPress={() => onNavigateTab('events')}>
                  <Text style={styles.linkText}>All Notices →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.noticesList}>
                {CAMPUS_NOTICES.map((n) => (
                  <View key={n.id} style={[styles.noticeItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                    <View style={styles.noticeTopRow}>
                      <View style={[styles.noticeTag, { backgroundColor: `${n.tagColor}22` }]}>
                        <Text style={[styles.noticeTagText, { color: n.tagColor }]}>{n.tag}</Text>
                      </View>
                      <Text style={[styles.noticeTime, { color: textSub }]}>{n.time}</Text>
                    </View>
                    <Text style={[styles.noticeTitle, { color: textTitle }]}>{n.title}</Text>
                    <Text style={[styles.noticeSub, { color: textSub }]}>{n.sub}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Daily Streak Card */}
            <View style={[styles.card, { backgroundColor: bgCard, borderColor: border }]}>
              <View style={styles.cardHeaderBetween}>
                <Text style={[styles.cardTitle, { color: textTitle }]}>Active Study Streak</Text>
                <Text style={styles.streakCount}>7 Days 🔥</Text>
              </View>
              <Text style={[styles.streakSub, { color: textSub }]}>You logged in each weekday this week. Keep up the momentum!</Text>
              <View style={styles.streakRow}>
                {DAYS_OF_WEEK.map((d, i) => (
                  <View key={i} style={styles.streakDay}>
                    <View
                      style={[
                        styles.streakCircle,
                        d.active ? { backgroundColor: '#c9a84c' } : { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#E2E8F0' },
                      ]}
                    >
                      {d.active && <Icon name="check" size={11} color="#0c0f10" />}
                    </View>
                    <Text style={[styles.streakDayLabel, { color: textSub }]}>{d.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Upcoming Events */}
            <View style={[styles.card, { backgroundColor: bgCard, borderColor: border }]}>
              <View style={styles.cardHeaderBetween}>
                <Text style={[styles.cardTitle, { color: textTitle }]}>Upcoming Events</Text>
                <TouchableOpacity onPress={() => onNavigateTab('events')}>
                  <Text style={styles.linkText}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.eventsList}>
                {UPCOMING_EVENTS.map((ev) => {
                  const isReg = registeredEvents[ev.id];
                  return (
                    <View key={ev.id} style={styles.eventRow}>
                      <View style={[styles.eventDateBox, { backgroundColor: isDark ? 'rgba(201,168,76,0.15)' : '#fdf8e8' }]}>
                        <Text style={styles.eventMonth}>{ev.month}</Text>
                        <Text style={styles.eventDay}>{ev.day}</Text>
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={[styles.eventTitle, { color: textTitle }]}>{ev.title}</Text>
                        <Text style={[styles.eventSub, { color: textSub }]}>{ev.sub}</Text>
                        <Text style={[styles.eventLoc, { color: textSub }]}>{ev.location}</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.registerBtn,
                          isReg && { backgroundColor: isDark ? 'rgba(201,168,76,0.15)' : '#fdf8e8', borderColor: '#c9a84c' },
                        ]}
                        onPress={() => toggleRegister(ev.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.registerBtnText, isReg && { color: isDark ? '#f0d074' : '#b8943e' }]}>
                          {isReg ? 'Registered ✓' : 'Register'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },

  /* Welcome Hero Card */
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  heroMain: {
    flexDirection: 'column',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  heroDate: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  heroActionBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },
  heroPrimaryBtnText: {
    color: '#0c0f10',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
  },
  heroSecondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 155,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  metricTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  metricIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  metricSub: {
    fontSize: 10.5,
    marginTop: 2,
    marginBottom: 8,
  },
  metricTrendPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  /* Cards Common */
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    marginBottom: 12,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 11.5,
    marginTop: 3,
  },
  linkText: {
    color: '#c9a84c',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Quick Actions */
  actionsScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  actionBtn: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 84,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Split Grid */
  splitGrid: {
    flexDirection: 'column',
  },
  splitGridRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1.4,
  },
  leftColDesktop: {
    flex: 1.4,
  },
  rightCol: {
    flex: 1,
  },

  /* Next Up Card */
  nextUpCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  nextUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  nextUpTime: {
    fontSize: 11,
    fontWeight: '700',
  },
  nextUpTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  nextUpMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  nextUpMeta: {
    fontSize: 11,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  /* Timeline */
  timelineList: {
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timelineLine: {
    alignItems: 'center',
    width: 18,
    marginRight: 10,
    paddingTop: 4,
  },
  tDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tLine: {
    width: 1.5,
    height: 38,
    marginTop: 3,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tTime: {
    fontSize: 11,
    fontWeight: '700',
  },
  completedTag: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  tTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  tRoom: {
    fontSize: 11,
    marginTop: 1,
  },
  tBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  tBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  /* Services Grid */
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  serviceBtn: {
    flex: 1,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  serviceBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* Notices */
  noticesList: {
    gap: 10,
  },
  noticeItem: {
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  noticeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noticeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noticeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  noticeTime: {
    fontSize: 10,
  },
  noticeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  noticeSub: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  /* Streak */
  streakCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FBBF24',
  },
  streakSub: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakDay: {
    alignItems: 'center',
  },
  streakCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  streakDayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  /* Events */
  eventsList: {
    gap: 10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventDateBox: {
    width: 44,
    height: 44,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMonth: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#c9a84c',
  },
  eventDay: {
    fontSize: 14,
    fontWeight: '900',
    color: '#c9a84c',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  eventSub: {
    fontSize: 10.5,
  },
  eventLoc: {
    fontSize: 10,
    marginTop: 1,
  },
  registerBtn: {
    backgroundColor: '#c9a84c',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#c9a84c',
  },
  registerBtnText: {
    color: '#0c0f10',
    fontSize: 11,
    fontWeight: '700',
  },
});
