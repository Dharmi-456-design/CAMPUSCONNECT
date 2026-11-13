import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';
import { getTeamPostsApi, createTeamRequestApi, createTeamPostApi } from '../api/team.api';

const FACULTIES = [
  'All Faculties',
  'Faculty of Engineering (SSIT)',
  'Faculty of IT & Computer Science (BCA/MCA)',
  'Faculty of Pharmacy (B.Pharm/Pharm.D)',
  'Faculty of Ayurvedic Medicine (BAMS)',
  'Faculty of Physiotherapy (BPT)',
  'Faculty of Commerce & Management (BBA/MBA)',
  'Faculty of Science (B.Sc/M.Sc)',
];

const DEFAULT_POSTS = [
  {
    _id: 'sih-2026-squad',
    title: 'Smart India Hackathon 2026 AI Squad',
    description: 'Looking for React Native and ML lead for SIH hackathon.',
    faculty: 'Faculty of Engineering (SSIT)',
    membersCount: 1,
    maxSize: 4,
    isOpen: true,
    skills: ['React Native', 'Python ML'],
    lead: {
      name: 'Dharmi Patel',
      college: 'Shree Swaminarayan Institute of Technology (SSIT), Kalol',
    },
    glowColor: '#06B6D4',
    theme: 'cyan',
  },
  {
    _id: 'sgh-2026-agri',
    title: 'Smart Gujarat Hackathon 2026 — AI Crop & Soil Health Diagnostic App',
    description:
      'Interdisciplinary squad representing Swaminarayan University Kalol. We have 1 Full-Stack mobile developer (React Native/Node.js) and are looking for 1 AI/ML developer from CSE/IT and 1 Agriculture/Pharmacy domain lead.',
    faculty: 'Faculty of Engineering (SSIT)',
    membersCount: 2,
    maxSize: 4,
    isOpen: true,
    skills: ['React Native', 'Node.js', 'Python ML', 'TensorFlow', 'UI/UX'],
    lead: {
      name: 'Dharmi Patel',
      college: 'Shree Swaminarayan Institute of Technology (SSIT), Kalol',
    },
    glowColor: '#10B981',
    theme: 'green',
  },
];

export default function TeamScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [bookmarked, setBookmarked] = useState({});
  const [applied, setApplied] = useState({});

  // Apply Modal state
  const [applyModal, setApplyModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [applySkills, setApplySkills] = useState('');
  const [applying, setApplying] = useState(false);

  // Post Team Modal state
  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [faculty, setFaculty] = useState('');
  const [skills, setSkills] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getTeamPostsApi();
      if (res.success && res.data?.posts?.length) {
        // Merge with default SIH posts for rich display
        setPosts([...res.data.posts, ...DEFAULT_POSTS]);
      } else {
        setPosts(DEFAULT_POSTS);
      }
    } catch (err) {
      setPosts(DEFAULT_POSTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleBookmark = (postId) => {
    setBookmarked((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const openApplyModal = (post) => {
    setSelectedPost(post);
    setApplyMessage(`Hi ${post.lead?.name || 'Team Lead'}, I would love to join "${post.title}". My skills align with your requirements!`);
    setApplySkills(user?.skills?.join(', ') || 'React Native, Problem Solving');
    setApplyModal(true);
  };

  const handleSendApplication = async () => {
    if (!selectedPost) return;
    try {
      setApplying(true);
      if (selectedPost._id && !selectedPost._id.startsWith('sih') && !selectedPost._id.startsWith('sgh')) {
        await createTeamRequestApi(selectedPost._id, applyMessage);
      }
      setApplied((prev) => ({ ...prev, [selectedPost._id]: true }));
      setApplyModal(false);
      const successMsg = `Application sent to ${selectedPost.lead?.name || 'the team lead'}! 🎉 They will review your profile shortly.`;
      if (Platform.OS === 'web') window.alert(successMsg);
      else Alert.alert('Application Submitted! 🚀', successMsg);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Could not send application.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setApplying(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!title.trim() || !desc.trim()) {
      if (Platform.OS === 'web') window.alert('Please fill out the project title and description.');
      else Alert.alert('Incomplete', 'Please fill out title and description.');
      return;
    }

    try {
      setSubmitting(true);
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await createTeamPostApi({
        title,
        description: desc,
        department: faculty,
        requiredSkills: skillsArray,
        maxMembers: Number(maxSize) || 4,
      });

      const newPost = res.success && res.data?.post
        ? res.data.post
        : {
            _id: `custom-${Date.now()}`,
            title,
            description: desc,
            faculty,
            membersCount: 1,
            maxSize: Number(maxSize) || 4,
            isOpen: true,
            skills: skillsArray.length ? skillsArray : ['Full-Stack', 'UI/UX'],
            lead: {
              name: user?.name || 'Dharmi Patel',
              college: user?.college || 'Swaminarayan University, Kalol',
            },
            glowColor: '#8B5CF6',
            theme: 'purple',
          };

      setPosts([newPost, ...posts]);
      setCreateModal(false);
      setTitle('');
      setDesc('');
      setSkills('');
      if (Platform.OS === 'web') window.alert('Squad listing created successfully! 🚀');
      else Alert.alert('Success 🎉', 'Squad listing posted!');
    } catch (err) {
      if (Platform.OS === 'web') window.alert(err.message || 'Failed to post team.');
      else Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchFaculty =
      selectedFaculty === 'All Faculties' ||
      p.faculty === selectedFaculty ||
      p.department === selectedFaculty;

    return matchSearch && matchFaculty;
  });

  const bgCard = theme.bgCard;
  const borderCard = theme.border;
  const textTitle = theme.textPrimary;
  const textSub = theme.textMuted;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPosts} tintColor="#c9a84c" />}
    >
      {/* ======================================================== */}
      {/* 1. HEADER ROW                                             */}
      {/* ======================================================== */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: textTitle }]}>
            Hackathon & Project Teams 🚀
          </Text>
          <Text style={[styles.pageSub, { color: textSub }]}>
            Collaborate. Innovate. Win together.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.postTeamBtn}
          onPress={() => setCreateModal(true)}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={15} color="#0c0f10" style={{ marginRight: 6 }} />
          <Text style={styles.postTeamText}>+ Post a Team</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* 2. TOP METRIC CARDS (4 Stats)                            */}
      {/* ======================================================== */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(201, 168, 76, 0.15)' }]}>
            <Icon name="users" size={17} color="#c9a84c" />
          </View>
          <View>
            <Text style={[styles.statNum, { color: textTitle }]}>{filteredPosts.length || 2}</Text>
            <Text style={[styles.statLabel, { color: textSub }]}>Active Squads</Text>
          </View>
        </View>

        <View style={[styles.statBox, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Icon name="user" size={17} color="#FBBF24" />
          </View>
          <View>
            <Text style={[styles.statNum, { color: textTitle }]}>6</Text>
            <Text style={[styles.statLabel, { color: textSub }]}>Open Positions</Text>
          </View>
        </View>

        <View style={[styles.statBox, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Icon name="award" size={17} color="#22D3EE" />
          </View>
          <View>
            <Text style={[styles.statNum, { color: textTitle }]}>3</Text>
            <Text style={[styles.statLabel, { color: textSub }]}>Faculty Teams</Text>
          </View>
        </View>

        <View style={[styles.statBox, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Icon name="zap" size={17} color="#34D399" />
          </View>
          <View>
            <Text style={[styles.statNum, { color: textTitle }]}>12</Text>
            <Text style={[styles.statLabel, { color: textSub }]}>Total Members</Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. SEARCH & FILTERS BAR                                   */}
      {/* ======================================================== */}
      <View style={styles.filterRow}>
        <View style={[styles.searchBox, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <Icon name="search" size={15} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: textTitle }]}
            placeholder="Search by project name, skills, or keywords..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
          {FACULTIES.slice(0, 4).map((fac) => {
            const isSel = selectedFaculty === fac;
            return (
              <TouchableOpacity
                key={fac}
                style={[
                  styles.filterPillBtn,
                  {
                    backgroundColor: isSel ? '#c9a84c' : bgCard,
                    borderColor: isSel ? '#c9a84c' : borderCard,
                  },
                ]}
                onPress={() => setSelectedFaculty(fac)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, { color: isSel ? '#0c0f10' : textSub, fontWeight: isSel ? '700' : '600' }]}>
                  {fac === 'All Faculties' ? 'All Faculties' : fac.split('(')[0].trim()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ======================================================== */}
      {/* 4. SQUAD LISTINGS CARDS (Cyan & Green Neon Outlines)      */}
      {/* ======================================================== */}
      <View style={styles.teamsList}>
        {filteredPosts.map((post, idx) => {
          const isCyan = idx % 2 === 0;
          const glowStroke = isCyan ? 'rgba(6, 182, 212, 0.4)' : 'rgba(16, 185, 129, 0.4)';
          const isSaved = bookmarked[post._id];
          const isApplied = applied[post._id];

          return (
            <View
              key={post._id || idx}
              style={[
                styles.teamCard,
                {
                  backgroundColor: bgCard,
                  borderColor: glowStroke,
                },
              ]}
            >
              {/* Left Column: Domain Badge */}
              <View style={[styles.domainBadgeBox, { backgroundColor: isCyan ? 'rgba(6, 182, 212, 0.16)' : 'rgba(16, 185, 129, 0.16)' }]}>
                <Icon name={isCyan ? 'cpu' : 'zap'} size={22} color={isCyan ? '#22D3EE' : '#34D399'} />
                <Text style={[styles.domainBadgeText, { color: isCyan ? '#22D3EE' : '#34D399' }]}>
                  {isCyan ? 'AI' : 'AGRI'}
                </Text>
              </View>

              {/* Middle Column: Details */}
              <View style={styles.teamDetailsCol}>
                {/* Badges Row */}
                <View style={styles.badgesRow}>
                  <View style={[styles.facultyBadge, { backgroundColor: isDark ? 'rgba(201, 168, 76, 0.15)' : '#fdf8e8' }]}>
                    <Text style={{ color: isDark ? '#f0d074' : '#b8943e', fontSize: 11, fontWeight: '700' }}>
                      {post.faculty || post.department || 'Faculty of Engineering (SSIT)'}
                    </Text>
                  </View>

                  <View style={[styles.membersBadge, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                    <Icon name="users" size={12} color="#22D3EE" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#22D3EE', fontSize: 11, fontWeight: '700' }}>
                      {post.membersCount || post.members?.length || 1}/{post.maxSize || post.maxMembers || 4} Members
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <View style={styles.statusDot} />
                    <Text style={{ color: '#34D399', fontSize: 11, fontWeight: '700' }}>Open</Text>
                  </View>

                  <TouchableOpacity onPress={() => toggleBookmark(post._id)} style={styles.bookmarkBtn} activeOpacity={0.7}>
                    <Icon name="bookmark" size={17} color={isSaved ? '#c9a84c' : isDark ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>
                </View>

                {/* Title & Description */}
                <Text style={[styles.teamTitle, { color: textTitle }]}>{post.title}</Text>
                <Text style={[styles.teamDesc, { color: textSub }]}>{post.description}</Text>

                {/* Required Roles & Skills */}
                <View style={styles.skillsSection}>
                  <Text style={[styles.skillsHeader, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                    Required Roles & Skills:
                  </Text>
                  <View style={styles.skillsList}>
                    {(post.skills || post.requiredSkills || ['React Native', 'Node.js']).map((sk, sIdx) => (
                      <View key={sIdx} style={[styles.skillPill, { backgroundColor: isDark ? '#141E30' : '#F1F5F9' }]}>
                        <Text style={[styles.skillText, { color: '#FBBF24' }]}>{sk}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Team Lead Section & Action Button */}
                <View style={styles.teamFooterRow}>
                  <View style={styles.leadInfo}>
                    <View style={styles.leadRow}>
                      <Icon name="user" size={13} color="#c9a84c" style={{ marginRight: 5 }} />
                      <Text style={[styles.leadLabel, { color: textSub }]}>Team Lead: </Text>
                      <Text style={[styles.leadName, { color: textTitle }]}>
                        {post.lead?.name || post.owner?.name || 'Dharmi Patel'}
                      </Text>
                    </View>
                    <View style={styles.leadRow}>
                      <Icon name="home" size={13} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 5 }} />
                      <Text style={[styles.collegeText, { color: textSub }]}>
                        {post.lead?.college || 'Shree Swaminarayan Institute of Technology (SSIT), Kalol'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.applyBtn,
                      isCyan ? { backgroundColor: '#0284C7' } : { backgroundColor: '#059669' },
                      isApplied && { opacity: 0.7 },
                    ]}
                    onPress={() => (isApplied ? null : openApplyModal(post))}
                    disabled={isApplied}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.applyBtnText}>
                      {isApplied ? 'Applied ✓' : 'Apply to Join →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Pagination */}
      <View style={styles.paginationRow}>
        <TouchableOpacity style={[styles.pageBtn, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <Text style={{ color: textSub }}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#c9a84c', borderColor: '#c9a84c' }]}>
          <Text style={{ color: '#0c0f10', fontWeight: '700' }}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pageBtn, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <Text style={{ color: textSub }}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pageBtn, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <Text style={{ color: textSub }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* 5. APPLY MODAL (Working interactive join popup)          */}
      {/* ======================================================== */}
      <Modal visible={applyModal} transparent animationType="fade" onRequestClose={() => setApplyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: borderCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textTitle }]}>
                Apply to {selectedPost?.title} 🚀
              </Text>
              <TouchableOpacity onPress={() => setApplyModal(false)}>
                <Icon name="x" size={18} color={textSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: textSub }]}>
              Send a personalized pitch and highlight your technical skills to the team lead.
            </Text>

            <Text style={[styles.fieldLabel, { color: textSub }]}>Why do you want to join this squad?</Text>
            <TextInput
              style={[styles.modalTextArea, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: borderCard, color: textTitle }]}
              multiline
              numberOfLines={3}
              value={applyMessage}
              onChangeText={setApplyMessage}
              placeholder="Tell the team lead about your background..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            />

            <Text style={[styles.fieldLabel, { color: textSub }]}>Relevant Skills & Tech Stack</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: borderCard, color: textTitle }]}
              value={applySkills}
              onChangeText={setApplySkills}
              placeholder="e.g. React Native, Python, UI/UX"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setApplyModal(false)}>
                <Text style={{ color: textSub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmApplyBtn, applying && { opacity: 0.7 }]}
                onPress={handleSendApplication}
                disabled={applying}
              >
                {applying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmApplyText}>Submit Application →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 6. CREATE SQUAD MODAL                                    */}
      {/* ======================================================== */}
      <Modal visible={createModal} transparent animationType="fade" onRequestClose={() => setCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: borderCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textTitle }]}>
                Post a Hackathon Squad 🚀
              </Text>
              <TouchableOpacity onPress={() => setCreateModal(false)}>
                <Icon name="x" size={18} color={textSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: textSub }]}>Project / Hackathon Title</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: borderCard, color: textTitle }]}
              placeholder="e.g. Smart India Hackathon 2026 AI Team"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.fieldLabel, { color: textSub }]}>Description & Goals</Text>
            <TextInput
              style={[styles.modalTextArea, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: borderCard, color: textTitle }]}
              multiline
              numberOfLines={3}
              placeholder="Explain the problem statement and roles needed..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={desc}
              onChangeText={setDesc}
            />

            <Text style={[styles.fieldLabel, { color: textSub }]}>Required Roles & Skills (comma separated)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: borderCard, color: textTitle }]}
              placeholder="e.g. React Native, Machine Learning, UI/UX"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={skills}
              onChangeText={setSkills}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModal(false)}>
                <Text style={{ color: textSub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmApplyBtn, submitting && { opacity: 0.7 }]}
                onPress={handleCreateTeam}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmApplyText}>Create Squad Listing →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollInner: { padding: 22, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  pageSub: { fontSize: 13, marginTop: 3 },

  postTeamBtn: {
    backgroundColor: '#c9a84c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    ...Platform.select({
      web: { boxShadow: '0px 3px 12px rgba(139,92,246,0.4)' },
      default: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  postTeamText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: 150,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 1 },

  /* Filters */
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  filterPillsScroll: { flexDirection: 'row', gap: 8 },
  filterPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  /* Teams List */
  teamsList: { gap: 18, marginBottom: 24 },
  teamCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  domainBadgeBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 2,
  },

  teamDetailsCol: { flex: 1 },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  facultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 5,
  },
  bookmarkBtn: { marginLeft: 'auto', padding: 4 },

  teamTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6, letterSpacing: -0.2 },
  teamDesc: { fontSize: 13, lineHeight: 19, marginBottom: 14 },

  skillsSection: { marginBottom: 14 },
  skillsHeader: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: { fontSize: 11.5, fontWeight: '700' },

  teamFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  leadInfo: { gap: 3 },
  leadRow: { flexDirection: 'row', alignItems: 'center' },
  leadLabel: { fontSize: 11.5 },
  leadName: { fontSize: 12, fontWeight: '700' },
  collegeText: { fontSize: 11 },

  applyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  applyBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  /* Pagination */
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalSub: { fontSize: 12.5, lineHeight: 18, marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  confirmApplyBtn: {
    backgroundColor: '#c9a84c',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmApplyText: { color: '#0c0f10', fontSize: 13, fontWeight: '700' },
});
