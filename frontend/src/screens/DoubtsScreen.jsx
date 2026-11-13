import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';

const STATS = [
  { label: 'Total Questions', value: '38+', sub: 'Campus doubts asked', icon: 'help-circle', color: '#22D3EE', bg: 'rgba(6,182,212,0.15)', glow: 'rgba(6,182,212,0.12)' },
  { label: 'Solved Answers', value: '112+', sub: 'Peer & faculty answers', icon: 'check-circle', color: '#34D399', bg: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.12)' },
  { label: 'Verified TAs', value: '100%', sub: 'Faculty review team', icon: 'shield', color: '#f0d074', bg: 'rgba(201,168,76,0.15)', glow: 'rgba(201,168,76,0.12)' },
  { label: 'Avg Solve Time', value: '< 2 hrs', sub: 'Fast community help', icon: 'zap', color: '#FBBF24', bg: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.12)' },
];

const SUBJECTS = [
  'All Subjects',
  'Analysis & Design of Algorithms',
  'Computer Networks',
  'Database Management Systems',
  'Physical Pharmaceutics',
  'Pharmaceutical Chemistry',
  'Dravyaguna & Anatomy',
  'Biomechanics',
  'Medical Surgical Nursing',
];

const INITIAL_DOUBTS = [
  {
    id: 'd-1',
    title: 'How to calculate Time Complexity for Nested Loops with logarithmic increments?',
    subject: 'Analysis & Design of Algorithms',
    description: 'In my ADA tutorial test, there was a loop where i multiplies by 2 each iteration while j increases by 1. How do we derive the exact Big-O master theorem equation for this?',
    author: { name: 'Dharmi Patel', branch: 'SSIT Computer Engg. • Sem 3', initial: 'D', avatarBg: '#c9a84c' },
    upvotes: 18,
    isUpvoted: false,
    answers: [
      {
        id: 'a-1',
        text: 'Since i doubles every iteration (i = i * 2), the outer loop runs log₂(N) times. The inner loop running N times gives total time complexity O(N log N)!',
        author: { name: 'Prof. Harsh Shah', role: 'Faculty Mentor' },
        upvotes: 14,
        time: '1h ago',
      },
    ],
  },
  {
    id: 'd-2',
    title: 'What is the key difference between Distance Vector and Link State Routing Protocols in CN?',
    subject: 'Computer Networks',
    description: 'Specifically regarding Bellman-Ford vs Dijkstra algorithm convergence speed and count-to-infinity problem.',
    author: { name: 'Rahul Mehta', branch: 'SSIT Computer Engg. • Sem 5', initial: 'R', avatarBg: '#06B6D4' },
    upvotes: 12,
    isUpvoted: false,
    answers: [
      {
        id: 'a-2',
        text: 'Distance Vector (RIP) uses Bellman-Ford and suffers from count-to-infinity due to slow convergence. Link State (OSPF) uses Dijkstra with global topology knowledge for instant convergence!',
        author: { name: 'Dharmi Patel', role: 'Student TA' },
        upvotes: 9,
        time: '3h ago',
      },
    ],
  },
  {
    id: 'd-3',
    title: 'Noyes-Whitney equation for Dissolution Rate calculations in Pharmaceutics',
    subject: 'Physical Pharmaceutics',
    description: 'Can someone explain how boundary layer thickness (h) affects dissolution rate in solid dosage form testing?',
    author: { name: 'Ananya Sharma', branch: 'B.Pharm • Sem 3', initial: 'A', avatarBg: '#10B981' },
    upvotes: 9,
    isUpvoted: false,
    answers: [],
  },
];

const POPULAR_SUBJECTS = [
  { name: 'Analysis & Design of Algorithms', count: '14 Questions' },
  { name: 'Computer Networks', count: '10 Questions' },
  { name: 'Database Management Systems', count: '08 Questions' },
  { name: 'Physical Pharmaceutics', count: '06 Questions' },
];

export default function DoubtsScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [doubts, setDoubts] = useState(INITIAL_DOUBTS);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [search, setSearch] = useState('');

  // Reply / Answer Expansion & Input state
  const [expandedId, setExpandedId] = useState(null);
  const [answerInputText, setAnswerInputText] = useState({});

  // Ask Doubt Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [dTitle, setDTitle] = useState('');
  const [dSubject, setDSubject] = useState('');
  const [dDesc, setDDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Upvote Question Action
  const handleToggleUpvote = (id) => {
    setDoubts((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              isUpvoted: !d.isUpvoted,
              upvotes: d.isUpvoted ? d.upvotes - 1 : d.upvotes + 1,
            }
          : d
      )
    );
  };

  // Reply / Post Answer Action (Fixed & Fully Functional)
  const handlePostAnswer = (doubtId) => {
    const text = answerInputText[doubtId];
    if (!text || !text.trim()) {
      if (Platform.OS === 'web') window.alert('Please type an answer before posting.');
      else Alert.alert('Empty Answer', 'Please enter your answer text.');
      return;
    }

    const newAnswer = {
      id: `a-${Date.now()}`,
      text: text.trim(),
      author: {
        name: user?.name || 'Dharmi Patel',
        role: user?.branch ? `${user.branch} Student` : 'Campus Scholar',
      },
      upvotes: 1,
      time: 'Just now',
    };

    setDoubts((prev) =>
      prev.map((d) =>
        d.id === doubtId
          ? {
              ...d,
              answers: [...d.answers, newAnswer],
            }
          : d
      )
    );

    setAnswerInputText((p) => ({ ...p, [doubtId]: '' }));
    setExpandedId(doubtId);

    if (Platform.OS === 'web') window.alert('Your answer has been posted! 🎉');
    else Alert.alert('Answer Posted 🎉', 'Your answer is live on the forum.');
  };

  // Post Question Modal Submit
  const handleAskSubmit = () => {
    if (!dTitle.trim() || !dDesc.trim()) {
      if (Platform.OS === 'web') window.alert('Please fill out Question Title and Details.');
      else Alert.alert('Incomplete', 'Please fill out Question Title and Details.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newQuestion = {
        id: `d-${Date.now()}`,
        title: dTitle,
        subject: dSubject,
        description: dDesc,
        author: {
          name: user?.name || 'Dharmi Patel',
          branch: `${user?.branch || 'Computer Engg.'} • Sem ${user?.semester || 3}`,
          initial: (user?.name || 'D').charAt(0).toUpperCase(),
          avatarBg: '#c9a84c',
        },
        upvotes: 1,
        isUpvoted: true,
        answers: [],
      };

      setDoubts([newQuestion, ...doubts]);
      setModalVisible(false);
      setDTitle(''); setDDesc('');
      setSubmitting(false);

      if (Platform.OS === 'web') window.alert('Question posted to Q&A Forum! ❓');
      else Alert.alert('Question Posted 🎉', 'Question published to Q&A Forum.');
    }, 600);
  };

  const filteredDoubts = doubts.filter((d) => {
    const matchSubject =
      selectedSubject === 'All Subjects' ||
      d.subject === selectedSubject ||
      (d.subject || '').toLowerCase().includes(selectedSubject.toLowerCase());

    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.subject.toLowerCase().includes(search.toLowerCase());

    return matchSubject && matchSearch;
  });

  const bgCard = theme.bgCard;
  const border = theme.border;
  const textTitle = theme.textPrimary;
  const textSub = theme.textMuted;

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ======================================================== */}
      {/* 1. HEADER ROW                                             */}
      {/* ======================================================== */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: textTitle }]}>
            Doubts & Q&A Forum ❓
          </Text>
          <Text style={[styles.pageSub, { color: textSub }]}>
            Ask technical doubts and get instant solutions from peer scholars & TAs
          </Text>
        </View>

        <TouchableOpacity style={styles.askBtn} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Icon name="help-circle" size={14} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.askBtnText}>+ Ask Doubt</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* 2. TOP 4 GLOWING STATS CARDS                             */}
      {/* ======================================================== */}
      <View style={styles.statsGrid}>
        {STATS.map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: bgCard, borderColor: border }]}>
            <View style={[styles.statGlow, { backgroundColor: s.glow }]} />
            <Text style={[styles.statLabel, { color: textSub }]}>{s.label}</Text>
            <Text style={[styles.statValue, { color: textTitle }]}>{s.value}</Text>
            <Text style={[styles.statSub, { color: textSub }]}>{s.sub}</Text>
            <View style={styles.statFooter}>
              <View style={[styles.statIconCircle, { backgroundColor: s.bg }]}>
                <Icon name={s.icon} size={16} color={s.color} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* ======================================================== */}
      {/* 3. SEARCH & SUBJECT FILTER BAR                           */}
      {/* ======================================================== */}
      <View style={[styles.filtersBox, { backgroundColor: bgCard, borderColor: border }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchWrap, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border }]}>
            <Icon name="search" size={15} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: textTitle }]}
              placeholder="Search doubts by concept, equation, subject..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Subject Pills Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {SUBJECTS.map((s) => {
            const isSel = selectedSubject === s;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSel ? '#06B6D4' : isDark ? '#141D2D' : '#F1F5F9',
                    borderColor: isSel ? '#06B6D4' : border,
                  },
                ]}
                onPress={() => setSelectedSubject(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: isSel ? '#FFF' : textSub }]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ======================================================== */}
      {/* 4. TWO-COLUMN SPLIT: Doubts Feed + Right Widgets         */}
      {/* ======================================================== */}
      <View style={[styles.splitGrid, isDesktop && styles.splitGridRow]}>
        {/* LEFT COLUMN: Question Cards Feed */}
        <View style={styles.leftCol}>
          {filteredDoubts.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={[styles.doubtCard, { backgroundColor: bgCard, borderColor: border }]}>
                {/* Top Row: Subject Tag + Upvotes */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.subjectPill, { backgroundColor: 'rgba(6,182,212,0.15)' }]}>
                    <Text style={{ color: '#22D3EE', fontSize: 11, fontWeight: '700' }}>{item.subject}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.upvoteBtn, item.isUpvoted && { backgroundColor: isDark ? 'rgba(201,168,76,0.2)' : '#fdf8e8', borderColor: '#c9a84c' }]}
                    onPress={() => handleToggleUpvote(item.id)}
                    activeOpacity={0.8}
                  >
                    <Icon name="thumbs-up" size={13} color={item.isUpvoted ? '#c9a84c' : textSub} style={{ marginRight: 5 }} />
                    <Text style={{ color: item.isUpvoted ? (isDark ? '#f0d074' : '#b8943e') : textSub, fontSize: 12, fontWeight: '700' }}>
                      {item.upvotes}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Title & Description */}
                <Text style={[styles.doubtTitle, { color: textTitle }]}>{item.title}</Text>
                <Text style={[styles.doubtDesc, { color: textSub }]}>{item.description}</Text>

                {/* Author & Reply / Answers Toggle Row */}
                <View style={styles.cardFooter}>
                  <View style={styles.authorRow}>
                    <View style={[styles.authorAvatarCircle, { backgroundColor: item.author?.avatarBg || '#c9a84c' }]}>
                      <Text style={[styles.avatarInitial, { color: '#0c0f10' }]}>{item.author?.initial || 'D'}</Text>
                    </View>
                    <View>
                      <Text style={[styles.authorName, { color: textTitle }]}>{item.author?.name || 'Dharmi Patel'}</Text>
                      <Text style={[styles.authorBranch, { color: textSub }]}>{item.author?.branch || 'Computer Engg.'}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.replyToggleBtn, { backgroundColor: isExpanded ? '#c9a84c' : isDark ? 'rgba(201,168,76,0.15)' : '#fdf8e8' }]}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                    activeOpacity={0.8}
                  >
                    <Icon name="message-square" size={13} color={isExpanded ? '#0c0f10' : isDark ? '#f0d074' : '#b8943e'} style={{ marginRight: 6 }} />
                    <Text style={[styles.replyToggleText, { color: isExpanded ? '#0c0f10' : isDark ? '#f0d074' : '#b8943e' }]}>
                      {item.answers?.length || 0} Reply{item.answers?.length !== 1 ? 'ies' : ''} {isExpanded ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ==================================================== */}
                {/* EXPANDABLE REPLIES / ANSWERS PANEL                   */}
                {/* ==================================================== */}
                {isExpanded && (
                  <View style={[styles.answersBox, { borderTopColor: border }]}>
                    <Text style={[styles.answersHeading, { color: textTitle }]}>
                      Answers ({item.answers?.length || 0})
                    </Text>

                    {(item.answers || []).map((ans) => (
                      <View key={ans.id} style={[styles.ansBubble, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border }]}>
                        <View style={styles.ansHeader}>
                          <Text style={[styles.ansAuthor, { color: textTitle }]}>💡 {ans.author?.name}</Text>
                          <Text style={[styles.ansRole, { color: isDark ? '#f0d074' : '#b8943e' }]}> • {ans.author?.role}</Text>
                          <Text style={[styles.ansTime, { color: textSub }]}>{ans.time}</Text>
                        </View>
                        <Text style={[styles.ansText, { color: isDark ? '#CBD5E1' : '#334155' }]}>{ans.text}</Text>
                      </View>
                    ))}

                    {/* REPLY INPUT ROW (WORKING BUTTON) */}
                    <View style={styles.addAnsRow}>
                      <TextInput
                        style={[styles.ansInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                        placeholder="Write your answer or solution step..."
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={answerInputText[item.id] || ''}
                        onChangeText={(txt) => setAnswerInputText((p) => ({ ...p, [item.id]: txt }))}
                      />
                      <TouchableOpacity
                        style={styles.postAnsBtn}
                        onPress={() => handlePostAnswer(item.id)}
                        activeOpacity={0.85}
                      >
                        <Icon name="send" size={13} color="#FFF" style={{ marginRight: 5 }} />
                        <Text style={styles.postAnsBtnText}>Post Reply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* RIGHT COLUMN: Popular Subjects & TA Team Widgets */}
        <View style={styles.rightCol}>
          {/* Popular Subjects */}
          <View style={[styles.widgetCard, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={[styles.widgetTitle, { color: textTitle }]}>Popular Q&A Topics</Text>
            <View style={styles.widgetList}>
              {POPULAR_SUBJECTS.map((s, idx) => (
                <View key={idx} style={[styles.widgetRow, { borderBottomColor: border }]}>
                  <Text style={[styles.widgetName, { color: textTitle }]}>{s.name}</Text>
                  <Text style={[styles.widgetCount, { color: '#22D3EE' }]}>{s.count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Ask Doubt Promo */}
          <View style={styles.askPromoCard}>
            <Text style={{ fontSize: 24, marginBottom: 6 }}>❓</Text>
            <Text style={styles.askPromoTitle}>Stuck on a lab algorithm or tutorial equation?</Text>
            <Text style={styles.askPromoSub}>Ask our student TAs and faculty mentors for instant step-by-step help.</Text>
            <TouchableOpacity style={styles.askPromoBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.askPromoBtnText}>+ Post Question Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* ASK DOUBT MODAL                                       */}
      {/* ======================================================== */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textTitle }]}>Ask a Question / Doubt ❓</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={18} color={textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: textSub }]}>Question Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. How to calculate Time Complexity for Binary Search Tree?"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={dTitle}
                onChangeText={setDTitle}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Subject Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. Analysis & Design of Algorithms"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={dSubject}
                onChangeText={setDSubject}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Question Details & Equation *</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                multiline
                numberOfLines={4}
                placeholder="Explain the step where you got stuck..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={dDesc}
                onChangeText={setDDesc}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: textSub, fontWeight: '600', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleAskSubmit} disabled={submitting}>
                  {submitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.confirmBtnText}>Post Question →</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 22, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  pageSub: { fontSize: 12.5, marginTop: 2 },
  askBtn: {
    backgroundColor: '#06B6D4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8.5,
    borderRadius: 9,
    ...Platform.select({
      web: { boxShadow: '0px 3px 12px rgba(6,182,212,0.4)' },
      default: {
        shadowColor: '#06B6D4',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  askBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 18 },
  statCard: { flex: 1, minWidth: 170, borderRadius: 16, borderWidth: 1, padding: 16, position: 'relative', overflow: 'hidden', minHeight: 120, justifyContent: 'space-between' },
  statGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, top: -40, right: -40 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  statSub: { fontSize: 11 },
  statFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  statIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  /* Filter Box */
  filtersBox: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 18 },
  searchRow: { marginBottom: 10 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 9, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  pillsScroll: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  pillText: { fontSize: 11.5, fontWeight: '600' },

  /* Two Column Layout */
  splitGrid: { flexDirection: 'column' },
  splitGridRow: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  leftCol: { flex: 1.4, gap: 14 },
  rightCol: { flex: 1, gap: 16 },

  /* Doubt Card */
  doubtCard: { borderRadius: 16, borderWidth: 1.5, padding: 18 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  subjectPill: { paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: 6 },
  upvoteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  doubtTitle: { fontSize: 15.5, fontWeight: '800', lineHeight: 21, marginBottom: 6 },
  doubtDesc: { fontSize: 12.5, lineHeight: 18, marginBottom: 12 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorAvatarCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  authorName: { fontSize: 12, fontWeight: '700' },
  authorBranch: { fontSize: 10.5 },

  replyToggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  replyToggleText: { fontSize: 12, fontWeight: '700' },

  /* Answers Box */
  answersBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  answersHeading: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  ansBubble: { borderRadius: 10, borderWidth: 1, padding: 12 },
  ansHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ansAuthor: { fontSize: 12, fontWeight: '700' },
  ansRole: { fontSize: 11, fontWeight: '600' },
  ansTime: { fontSize: 10, marginLeft: 'auto' },
  ansText: { fontSize: 12.5, lineHeight: 18 },

  addAnsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  ansInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12.5 },
  postAnsBtn: { backgroundColor: '#c9a84c', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  postAnsBtnText: { color: '#0c0f10', fontSize: 12.5, fontWeight: '700' },

  /* Widgets */
  widgetCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  widgetTitle: { fontSize: 14.5, fontWeight: '800', marginBottom: 12 },
  widgetList: { gap: 8 },
  widgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  widgetName: { fontSize: 12.5, fontWeight: '600' },
  widgetCount: { fontSize: 11.5, fontWeight: '700' },

  askPromoCard: { backgroundColor: '#0F2942', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', padding: 18, alignItems: 'center' },
  askPromoTitle: { color: '#FFF', fontSize: 13.5, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  askPromoSub: { color: '#A5F3FC', fontSize: 11.5, textAlign: 'center', lineHeight: 16, marginBottom: 12 },
  askPromoBtn: { backgroundColor: '#06B6D4', paddingHorizontal: 14, paddingVertical: 7.5, borderRadius: 8 },
  askPromoBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  /* Modals */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', maxWidth: 500, borderRadius: 18, borderWidth: 1, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  modalInput: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8.5, fontSize: 13 },
  modalTextArea: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8.5, fontSize: 13, minHeight: 70, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, borderWidth: 1, alignItems: 'center' },
  confirmBtn: { flex: 2, backgroundColor: '#06B6D4', paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
