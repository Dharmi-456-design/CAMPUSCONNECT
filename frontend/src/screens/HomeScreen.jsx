import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';

export default function HomeScreen({ onNavigateTab }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  // Segment Tab State: 'upcoming' | 'syllabus' | 'routine'
  const [activeSegment, setActiveSegment] = useState('upcoming');

  // Interactive Class Checkmarks state (1 to 6)
  const [completedClasses, setCompletedClasses] = useState([1, 2, 3]);

  // Modal State for Quick Actions
  const [modalType, setModalType] = useState(null);

  const toggleClass = (classNum) => {
    if (completedClasses.includes(classNum)) {
      setCompletedClasses(completedClasses.filter((c) => c !== classNum));
    } else {
      setCompletedClasses([...completedClasses, classNum]);
    }
  };

  const studentName = user?.name || 'Michael Aguero';
  const firstName = studentName.split(' ')[0];
  const studentId = user?.rollNumber || '17081010086';
  const gpa = user?.gpa || '3.67';
  const sks = user?.sks || '89';
  const semester = user?.semester ? `0${user.semester}` : '06';

  // 8 Quick Actions (matches Screenshot 2 Alma Ata Mobile)
  const ALMA_ATA_SERVICES = [
    { id: 'results', label: 'Hasil Studi', icon: 'file-text', color: '#3B82F6', bg: '#EFF6FF', action: () => onNavigateTab?.('academics') },
    { id: 'transkrip', label: 'Transkrip', icon: 'award', color: '#10B981', bg: '#ECFDF5', action: () => setModalType('transcript') },
    { id: 'jadwal', label: 'Jadwal', icon: 'calendar', color: '#06B6D4', bg: '#ECFEFF', action: () => setActiveSegment('routine') },
    { id: 'berita', label: 'Berita', icon: 'bell', color: '#F59E0B', bg: '#FFFBEB', action: () => onNavigateTab?.('events') },
    { id: 'pembayaran', label: 'Pembayaran', icon: 'credit-card', color: '#16A36A', bg: '#E8F5EE', action: () => setModalType('payment') },
    { id: 'buku', label: 'Buku / Notes', icon: 'book-open', color: '#8B5CF6', bg: '#F5F3FF', action: () => onNavigateTab?.('notes') },
    { id: 'presensi', label: 'Presensi', icon: 'check-circle', color: '#EC4899', bg: '#FDF2F8', action: () => setModalType('attendance') },
    { id: 'lainnya', label: 'Lainnya', icon: 'grid', color: '#6366F1', bg: '#EEF2FF', action: () => onNavigateTab?.('explore') },
  ];

  // Syllabus Chapters (matches Screenshot 4 Akbor Inside View)
  const SYLLABUS_CHAPTERS = [
    { id: 1, chapter: 'Chapter 1', title: 'Set & function', lessons: 'Lesson count 8', status: 'completed' },
    { id: 2, chapter: 'Chapter 2', title: 'Geometry & Coordinate Planes', lessons: 'Lesson count 10', status: 'completed' },
    { id: 3, chapter: 'Chapter 3', title: 'Infinite series & Convergence', lessons: 'Lesson count 8', status: 'active' },
    { id: 4, chapter: 'Chapter 4', title: 'Trigonometry & Polar Coordinates', lessons: 'Lesson count 10', status: 'upcoming' },
    { id: 5, chapter: 'Chapter 5', title: 'Differential Calculus & Limits', lessons: 'Lesson count 12', status: 'upcoming' },
  ];

  // Routine Timeline Items
  const ROUTINE_CLASSES = [
    { time: '10:00 AM - 10:45 AM', room: 'Class 10 - C', subject: 'Higher Math', topic: 'Chapter 7: Infinite series', teacher: 'Prof. Harsh Patel', color: '#16A36A' },
    { time: '11:00 AM - 12:30 PM', room: 'Lab SH-113', subject: 'Pemrograman Framework', topic: 'React Native & Mobile Architecture', teacher: 'Yuli Yuniar S.Kom, M.Kom', color: '#2563EB' },
    { time: '02:00 PM - 03:30 PM', room: 'Hall B-201', subject: 'Data Mining', topic: 'K-Means Clustering & Decision Trees', teacher: 'Agung Mulya S.Kom', color: '#7C3AED' },
  ];

  // Recent Notices (matches Screenshot 2 Berita Terbaru)
  const RECENT_NOTICES = [
    {
      id: 1,
      badge: 'Berita Fakultas',
      badgeColor: '#EF4444',
      badgeBg: '#FEE2E2',
      title: 'Alur Yudisium Dan Wisuda Periode 2026',
      date: '19 Nov 2026',
      readTime: '3 min read',
    },
    {
      id: 2,
      badge: 'Berita Kampus',
      badgeColor: '#16A36A',
      badgeBg: '#DCFCE7',
      title: 'Pendaftaran Program Magang Mahasiswa Bersertifikat (PMMB)',
      date: '14 Nov 2026',
      readTime: '5 min read',
    },
    {
      id: 3,
      badge: 'Pengumuman',
      badgeColor: '#F59E0B',
      badgeBg: '#FEF3C7',
      title: 'Tembus Melebihi Kuota, UAA Rangkul Mahasiswa Baru Jalur Prestasi',
      date: '10 Nov 2026',
      readTime: '2 min read',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
      contentContainerStyle={[styles.contentContainer, isDesktop && styles.desktopContainer]}
      showsVerticalScrollIndicator={false}
    >
      {/* ======================================================== */}
      {/* 1. TOP GREETING & PROFILE BAR                            */}
      {/* ======================================================== */}
      <View style={styles.topGreetingBar}>
        <View style={styles.greetingLeft}>
          <View style={styles.avatarCircle}>
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>{firstName.charAt(0)}</Text>
            )}
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.greetingTextCol}>
            <Text style={[styles.greetingSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Good Morning,
            </Text>
            <Text style={[styles.greetingName, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
              {studentName}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bellBtn, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
          onPress={() => onNavigateTab?.('events')}
        >
          <Icon name="bell" size={18} color={isDark ? '#F8FAFC' : '#172B4D'} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* 2. ALMA ATA STUDENT SCORECARD (Screenshot 2)             */}
      {/* ======================================================== */}
      <View style={[styles.almaAtaCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
        <View style={styles.studentIdRow}>
          <View>
            <Text style={[styles.studentCardName, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>{studentName}</Text>
            <Text style={[styles.studentCardId, { color: isDark ? '#94A3B8' : '#64748B' }]}>ID: {studentId}</Text>
          </View>
          <View style={styles.activeStatusPill}>
            <Text style={styles.activeStatusText}>Aktif</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Jumlah SKS</Text>
            <Text style={[styles.statVal, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>{sks}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Indeks Prestasi</Text>
            <Text style={[styles.statVal, { color: '#16A36A' }]}>{gpa}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Semester</Text>
            <Text style={[styles.statVal, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>{semester}</Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. AKBOR DARK CLASS READINESS CARD (Screenshot 4)        */}
      {/* ======================================================== */}
      <View style={styles.darkBanner}>
        <View style={styles.darkBannerHeader}>
          <View style={styles.bookIconBadge}>
            <Icon name="book-open" size={20} color="#16A36A" />
          </View>
          <View style={styles.darkBannerTextCol}>
            <Text style={styles.darkBannerTitle}>You've got six classes</Text>
            <Text style={styles.darkBannerSub}>Ready to finish today!</Text>
          </View>
        </View>

        {/* 6 Circular Class Checkmark Pills */}
        <View style={styles.classPillsRow}>
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isDone = completedClasses.includes(num);
            return (
              <TouchableOpacity
                key={num}
                style={[
                  styles.classCircle,
                  isDone ? styles.classCircleDone : styles.classCirclePending,
                ]}
                onPress={() => toggleClass(num)}
                activeOpacity={0.8}
              >
                {isDone ? (
                  <Icon name="check" size={14} color="#0B0F19" />
                ) : (
                  <Text style={styles.classCircleText}>{num}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. SEGMENTED FILTER PILLS (Upcoming / Syllabus / Routine) */}
      {/* ======================================================== */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentPill,
            activeSegment === 'upcoming' && styles.segmentPillActive,
          ]}
          onPress={() => setActiveSegment('upcoming')}
        >
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'upcoming' && styles.segmentTextActive,
            ]}
          >
            Upcoming class
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentPill,
            activeSegment === 'syllabus' && styles.segmentPillActive,
          ]}
          onPress={() => setActiveSegment('syllabus')}
        >
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'syllabus' && styles.segmentTextActive,
            ]}
          >
            My Syllabus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentPill,
            activeSegment === 'routine' && styles.segmentPillActive,
          ]}
          onPress={() => setActiveSegment('routine')}
        >
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'routine' && styles.segmentTextActive,
            ]}
          >
            Routine
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* 5. ACTIVE CLASS CARD (Screenshot 4)                      */}
      {/* ======================================================== */}
      {activeSegment !== 'syllabus' && (
        <View style={styles.activeClassCard}>
          <View style={styles.classTimeRow}>
            <View style={styles.greenTimeBadge}>
              <Icon name="clock" size={14} color="#16A36A" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.classRoomText}>Class 10 - C</Text>
              <Text style={styles.classTimeText}>10:00 AM - 10:45 AM</Text>
            </View>
          </View>

          <View style={styles.classTopicRow}>
            <View style={styles.greenBookBadge}>
              <Icon name="book" size={14} color="#16A36A" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.classSubjectText}>Higher Math</Text>
              <Text style={styles.classChapterText}>Chapter 7: Infinite series</Text>
            </View>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 6. ALMA ATA 8-SERVICE GRID (Screenshot 2)                */}
      {/* ======================================================== */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
          Layanan Akademik
        </Text>
        <TouchableOpacity onPress={() => onNavigateTab?.('explore')}>
          <Text style={styles.sectionLink}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.serviceGrid}>
        {ALMA_ATA_SERVICES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.serviceItem}
            onPress={item.action}
            activeOpacity={0.75}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: item.bg }]}>
              <Icon name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.serviceLabel, { color: isDark ? '#E2E8F0' : '#172B4D' }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ======================================================== */}
      {/* 7. AKBOR CONNECTED SYLLABUS OVERVIEW (Screenshot 4)      */}
      {/* ======================================================== */}
      <View style={styles.sectionHeader}>
        <View style={styles.syllabusOverviewBadge}>
          <Text style={styles.syllabusOverviewText}>Syllabus overview</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateTab?.('academics')}>
          <Text style={styles.sectionLink}>Full Syllabus →</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.syllabusCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
        {SYLLABUS_CHAPTERS.map((item, index) => {
          const isLast = index === SYLLABUS_CHAPTERS.length - 1;
          const isDone = item.status === 'completed';
          const isActive = item.status === 'active';

          return (
            <View key={item.id} style={styles.syllabusRow}>
              {/* Vertical Timeline Indicator */}
              <View style={styles.timelineCol}>
                <View
                  style={[
                    styles.timelineDot,
                    isDone && styles.timelineDotDone,
                    isActive && styles.timelineDotActive,
                  ]}
                />
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      isDone ? styles.timelineLineDone : styles.timelineLinePending,
                    ]}
                  />
                )}
              </View>

              {/* Chapter Information */}
              <TouchableOpacity
                style={styles.chapterContent}
                onPress={() => onNavigateTab?.('academics')}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chapterName, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
                    {item.chapter}
                  </Text>
                  <Text style={[styles.chapterTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    {item.title}  •  <Text style={{ color: '#16A36A' }}>{item.lessons}</Text>
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* ======================================================== */}
      {/* 8. ALMA ATA BERITA TERBARU / RECENT NOTICES (Screenshot 2)*/}
      {/* ======================================================== */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
          Berita Terbaru
        </Text>
        <TouchableOpacity onPress={() => onNavigateTab?.('events')}>
          <Text style={styles.sectionLink}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.noticesList}>
        {RECENT_NOTICES.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.noticeCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
            onPress={() => onNavigateTab?.('events')}
            activeOpacity={0.8}
          >
            <View style={styles.noticeHeaderRow}>
              <View style={[styles.noticeBadge, { backgroundColor: n.badgeBg }]}>
                <Text style={[styles.noticeBadgeText, { color: n.badgeColor }]}>{n.badge}</Text>
              </View>
              <Icon name="bookmark" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
            </View>
            <Text style={[styles.noticeTitle, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
              {n.title}
            </Text>
            <View style={styles.noticeFooterRow}>
              <Text style={styles.noticeDate}>{n.date}</Text>
              <Text style={styles.noticeDate}>•  {n.readTime}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* MODAL POPUPS FOR QUICK ACTIONS */}
      {modalType && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? '#F8FAFC' : '#172B4D' }]}>
                  {modalType === 'transcript' ? '📜 Official Transcript' : modalType === 'payment' ? '💳 Status Pembayaran' : '✅ Ringkasan Presensi'}
                </Text>
                <TouchableOpacity onPress={() => setModalType(null)}>
                  <Icon name="x" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              </View>

              {modalType === 'transcript' && (
                <View style={styles.modalBody}>
                  <Text style={[styles.modalText, { color: isDark ? '#E2E8F0' : '#172B4D' }]}>
                    Cum Laude Standing: GPA {gpa} with {sks} completed credit units across Semesters 1 through 6.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => {
                      setModalType(null);
                      if (Platform.OS === 'web') window.alert('Transcript PDF downloaded to device storage.');
                      else Alert.alert('Downloaded', 'Transcript PDF saved to downloads.');
                    }}
                  >
                    <Text style={styles.modalPrimaryBtnText}>Download Official PDF</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modalType === 'payment' && (
                <View style={styles.modalBody}>
                  <View style={styles.paymentStatusBadge}>
                    <Icon name="check-circle" size={16} color="#16A36A" />
                    <Text style={styles.paymentStatusText}>All Semester 6 Tuition Fees LUNAS</Text>
                  </View>
                  <Text style={[styles.modalText, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 }]}>
                    Virtual Account No: 880917081010086. No outstanding financial holds on exam registration.
                  </Text>
                  <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setModalType(null)}>
                    <Text style={styles.modalPrimaryBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modalType === 'attendance' && (
                <View style={styles.modalBody}>
                  <Text style={[styles.modalText, { color: isDark ? '#E2E8F0' : '#172B4D' }]}>
                    Overall Attendance: <Text style={{ color: '#16A36A', fontWeight: '800' }}>94.2%</Text>
                  </Text>
                  <Text style={[styles.modalText, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 6 }]}>
                    Attended 51 of 54 conducted sessions. Qualified to sit for upcoming semester examinations.
                  </Text>
                  <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setModalType(null)}>
                    <Text style={styles.modalPrimaryBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
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

  /* 1. Top Greeting */
  topGreetingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  onlineBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  greetingTextCol: {},
  greetingSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 9,
    right: 9,
  },

  /* 2. Alma Ata Card */
  almaAtaCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  studentIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  studentCardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentCardId: {
    fontSize: 12,
    marginTop: 2,
  },
  activeStatusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatusText: {
    color: '#16A36A',
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 28,
  },

  /* 3. Akbor Dark Banner */
  darkBanner: {
    backgroundColor: '#172B4D',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  darkBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bookIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(22, 163, 106, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  darkBannerTextCol: {},
  darkBannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  darkBannerSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  classPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classCircleDone: {
    backgroundColor: '#16A36A',
  },
  classCirclePending: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  classCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  /* 4. Segment Pills */
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  segmentPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  segmentPillActive: {
    backgroundColor: '#E8F5EE',
    borderWidth: 1,
    borderColor: '#16A36A',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#16A36A',
    fontWeight: '700',
  },

  /* 5. Active Class Card */
  activeClassCard: {
    backgroundColor: '#172B4D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  classTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  greenTimeBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 106, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classRoomText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  classTimeText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  classTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenBookBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 106, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classSubjectText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  classChapterText: {
    color: '#94A3B8',
    fontSize: 11,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A36A',
  },

  /* 6. Service Grid */
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 14,
  },
  serviceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* 7. Syllabus Overview */
  syllabusOverviewBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  syllabusOverviewText: {
    color: '#16A36A',
    fontSize: 12,
    fontWeight: '700',
  },
  syllabusCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  syllabusRow: {
    flexDirection: 'row',
  },
  timelineCol: {
    alignItems: 'center',
    width: 22,
    marginRight: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  timelineDotDone: {
    backgroundColor: '#16A36A',
  },
  timelineDotActive: {
    backgroundColor: '#16A36A',
    borderWidth: 2,
    borderColor: '#DCFCE7',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineLineDone: {
    backgroundColor: '#16A36A',
  },
  timelineLinePending: {
    backgroundColor: '#E2E8F0',
  },
  chapterContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  chapterName: {
    fontSize: 13,
    fontWeight: '700',
  },
  chapterTitle: {
    fontSize: 11,
    marginTop: 2,
  },

  /* 8. Recent Notices */
  noticesList: {
    gap: 12,
    marginBottom: 20,
  },
  noticeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  noticeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noticeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 8,
  },
  noticeFooterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  noticeDate: {
    fontSize: 11,
    color: '#94A3B8',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBody: {
    marginTop: 4,
  },
  modalText: {
    fontSize: 13,
    lineHeight: 19,
  },
  modalPrimaryBtn: {
    backgroundColor: '#16A36A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
  },
  paymentStatusText: {
    color: '#16A36A',
    fontSize: 12,
    fontWeight: '700',
  },
});
