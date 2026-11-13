import React, { useState, useEffect } from 'react';
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
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';
import { getNotesApi, uploadNoteApi, toggleBookmarkApi } from '../api/notes.api';

const STATS = [
  { label: 'Verified Notes', value: '42+', sub: 'Handwritten & PYQs', icon: 'book-open', color: '#f0d074', bg: 'rgba(201,168,76,0.15)', glow: 'rgba(201,168,76,0.12)' },
  { label: 'Total Downloads', value: '737+', sub: 'Campus students', icon: 'download', color: '#34D399', bg: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.12)' },
  { label: 'Avg Rating', value: '4.9 ★', sub: 'Peer reviewed', icon: 'star', color: '#FBBF24', bg: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.12)' },
  { label: 'Contributors', value: '18+', sub: 'Top campus scholars', icon: 'users', color: '#22D3EE', bg: 'rgba(6,182,212,0.15)', glow: 'rgba(6,182,212,0.12)' },
];

const BRANCHES = [
  'All Faculties',
  'Faculty of Engineering (SSIT)',
  'Faculty of IT & Computer Science (BCA/MCA)',
  'Faculty of Pharmacy (B.Pharm/Pharm.D)',
  'Faculty of Ayurvedic Medicine (BAMS)',
  'Faculty of Physiotherapy (BPT)',
  'Faculty of Commerce & Management (BBA/MBA)',
];

const SEMESTERS = ['All Sems', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

const INITIAL_NOTES = [
  {
    _id: 'note-ada-5th',
    title: 'Analysis & Design of Algorithms (ADA) — Complete Handwritten Notes & PYQs',
    subject: 'Algorithms & Complexity',
    branch: 'Faculty of Engineering (SSIT)',
    semester: 5,
    description: 'Unit 1 to 5 notes covering Divide & Conquer, Dynamic Programming, Greedy Algorithms, Graph Algorithms & NP-Completeness. Includes last 5 years Solved University Exam Papers.',
    tags: ['ADA', 'Handwritten', 'Solved PYQs', 'Algorithms'],
    fileUrl: 'http://192.168.1.70:5000/public/notes/ada_complete_notes.pdf',
    fileType: 'pdf',
    uploaderName: 'Prof. Harsh Patel',
    downloads: 342,
    rating: 4.9,
    bookmarksCount: 88,
  },
  {
    _id: 'note-cn-5th',
    title: 'Computer Networks (CN) — OSI & TCP/IP Protocol Suite Guide',
    subject: 'Computer Networks',
    branch: 'Faculty of Engineering (SSIT)',
    semester: 5,
    description: 'Layer by layer breakdown with socket programming examples in C/Python, subnetting shortcuts & Cisco Packet Tracer lab viva questions.',
    tags: ['Networking', 'OSI Model', 'Subnetting', 'Lab Guide'],
    fileUrl: 'http://192.168.1.70:5000/public/notes/cn_guide.pdf',
    fileType: 'pdf',
    uploaderName: 'Dharmi Patel',
    downloads: 215,
    rating: 4.8,
    bookmarksCount: 54,
  },
  {
    _id: 'note-pharmacy-3rd',
    title: 'Physical Pharmaceutics & Solution Kinetics — Unit 2 Notes',
    subject: 'Pharmaceutics',
    branch: 'Faculty of Pharmacy (B.Pharm/Pharm.D)',
    semester: 3,
    description: 'Comprehensive notes on solubility, distribution coefficient, buffer capacity, and tonicity calculations for B.Pharm 3rd Semester.',
    tags: ['Pharmacy', 'Pharmaceutics', 'Solubility', 'B.Pharm'],
    fileUrl: 'http://192.168.1.70:5000/public/notes/pharmaceutics.pdf',
    fileType: 'pdf',
    uploaderName: 'Ananya Sharma',
    downloads: 180,
    rating: 4.7,
    bookmarksCount: 39,
  },
];

const POPULAR_SUBJECTS = [
  { name: 'Analysis & Design of Algorithms', count: '14 Notes' },
  { name: 'Computer Networks', count: '10 Notes' },
  { name: 'Database Management Systems', count: '08 Notes' },
  { name: 'Physical Pharmaceutics', count: '06 Notes' },
  { name: 'Dravyaguna & Anatomy', count: '05 Notes' },
];

const TOP_CONTRIBUTORS = [
  { name: 'Prof. Harsh Patel', branch: 'Computer Engg.', uploads: '12 Notes', rating: '4.9 ★' },
  { name: 'Dharmi Patel', branch: 'Computer Engg.', uploads: '14 Notes', rating: '4.9 ★' },
  { name: 'Ananya Sharma', branch: 'Pharmacy', uploads: '09 Notes', rating: '4.8 ★' },
];

export default function NotesScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Faculties');
  const [selectedSem, setSelectedSem] = useState('All Sems');
  const [bookmarks, setBookmarks] = useState({});

  // Upload Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');

  const handleBrowseFile = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const mb = (file.size / (1024 * 1024)).toFixed(2);
          setSelectedFileName(file.name);
          setSelectedFileSize(`${mb} MB`);
          if (!title) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
          }
        }
      };
      input.click();
    } else {
      setSelectedFileName('ada_complete_notes.pdf');
      setSelectedFileSize('3.2 MB');
      if (Platform.OS === 'web') window.alert('Selected "ada_complete_notes.pdf" (3.2 MB)');
    }
  };

  const toggleBookmark = (id) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewPdf = (url) => {
    if (Platform.OS === 'web') {
      window.open(url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
    } else {
      Linking.openURL(url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !subject.trim()) {
      if (Platform.OS === 'web') window.alert('Please enter a Note Title and Subject.');
      else Alert.alert('Incomplete', 'Please fill out Title and Subject.');
      return;
    }

    try {
      setSubmitting(true);
      const newNote = {
        _id: `note-${Date.now()}`,
        title,
        subject,
        branch,
        semester: Number(semester) || 5,
        description: description || 'Uploaded study note for campus students.',
        tags: tags ? tags.split(',').map((t) => t.trim()) : ['Handwritten'],
        fileUrl: 'http://192.168.1.70:5000/public/notes/uploaded_note.pdf',
        fileType: 'pdf',
        uploaderName: user?.name || 'Dharmi Patel',
        downloads: 1,
        rating: 5.0,
        bookmarksCount: 0,
      };

      setNotes([newNote, ...notes]);
      setModalVisible(false);
      setTitle(''); setSubject(''); setDescription(''); setTags('');
      if (Platform.OS === 'web') window.alert('Study Note published successfully! 🎉');
      else Alert.alert('Success 🎉', 'Study Note published!');
    } catch (err) {
      if (Platform.OS === 'web') window.alert('Could not upload note.');
      else Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchSearch =
      !search ||
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.subject?.toLowerCase().includes(search.toLowerCase()) ||
      n.description?.toLowerCase().includes(search.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchBranch =
      selectedBranch === 'All Faculties' ||
      n.branch === selectedBranch ||
      (n.branch || '').toLowerCase().includes(selectedBranch.toLowerCase().replace('faculty of ', ''));

    const matchSem =
      selectedSem === 'All Sems' ||
      String(n.semester) === selectedSem.replace('Sem ', '');

    return matchSearch && matchBranch && matchSem;
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
            Study Notes & PYQs Hub 📚
          </Text>
          <Text style={[styles.pageSub, { color: textSub }]}>
            Access verified lecture notes, handwritten solution guides, and past exam papers
          </Text>
        </View>

        <TouchableOpacity style={styles.uploadBtn} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Icon name="upload" size={14} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.uploadBtnText}>+ Upload Note</Text>
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
      {/* 3. SEARCH & FILTER BAR                                  */}
      {/* ======================================================== */}
      <View style={[styles.filtersBox, { backgroundColor: bgCard, borderColor: border }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchWrap, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border }]}>
            <Icon name="search" size={15} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: textTitle }]}
              placeholder="Search notes, subjects, units, question papers..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Faculty Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {BRANCHES.map((b) => {
            const isSel = selectedBranch === b;
            return (
              <TouchableOpacity
                key={b}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSel ? '#c9a84c' : isDark ? '#141D2D' : '#F1F5F9',
                    borderColor: isSel ? '#c9a84c' : border,
                  },
                ]}
                onPress={() => setSelectedBranch(b)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: isSel ? '#0c0f10' : textSub, fontWeight: isSel ? '700' : '600' }]}>
                  {b === 'All Faculties' ? 'All Faculties' : b.replace('Faculty of ', '')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Semester Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.pillsScroll, { marginTop: 8 }]}>
          {SEMESTERS.map((s) => {
            const isSel = selectedSem === s;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.semPill,
                  {
                    backgroundColor: isSel ? (isDark ? 'rgba(201,168,76,0.2)' : '#fdf8e8') : isDark ? '#141D2D' : '#F1F5F9',
                    borderColor: isSel ? '#c9a84c' : border,
                  },
                ]}
                onPress={() => setSelectedSem(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.semPillText, { color: isSel ? (isDark ? '#f0d074' : '#b8943e') : textSub }]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ======================================================== */}
      {/* 4. TWO-COLUMN SPLIT: Notes Feed + Right Widgets           */}
      {/* ======================================================== */}
      <View style={[styles.splitGrid, isDesktop && styles.splitGridRow]}>
        {/* LEFT COLUMN: Note Cards Feed */}
        <View style={styles.leftCol}>
          {filteredNotes.map((item) => {
            const isSaved = bookmarks[item._id];
            return (
              <View key={item._id} style={[styles.noteCard, { backgroundColor: bgCard, borderColor: border }]}>
                {/* Document Icon Box */}
                <View style={[styles.docIconBox, { backgroundColor: isDark ? 'rgba(201,168,76,0.16)' : '#fdf8e8' }]}>
                  <Icon name="file-text" size={22} color={isDark ? '#f0d074' : '#b8943e'} />
                  <Text style={[styles.docTypeText, { color: isDark ? '#f0d074' : '#b8943e' }]}>PDF</Text>
                </View>

                {/* Right Details */}
                <View style={styles.noteDetailsCol}>
                  <View style={styles.badgesRow}>
                    <View style={[styles.badgePill, { backgroundColor: isDark ? 'rgba(201,168,76,0.15)' : '#fdf8e8' }]}>
                      <Text style={{ color: isDark ? '#f0d074' : '#b8943e', fontSize: 10.5, fontWeight: '700' }}>
                        {item.branch ? item.branch.replace('Faculty of ', '') : 'Engineering'}
                      </Text>
                    </View>
                    <View style={[styles.badgePill, { backgroundColor: 'rgba(6,182,212,0.15)' }]}>
                      <Text style={{ color: '#22D3EE', fontSize: 10.5, fontWeight: '700' }}>Sem {item.semester}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleBookmark(item._id)} style={{ marginLeft: 'auto' }}>
                      <Icon name="bookmark" size={16} color={isSaved ? '#c9a84c' : isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.noteTitle, { color: textTitle }]}>{item.title}</Text>
                  <Text style={[styles.noteSubject, { color: isDark ? '#f0d074' : '#b8943e' }]}>📖 {item.subject}</Text>
                  <Text style={[styles.noteDesc, { color: textSub }]}>{item.description}</Text>

                  <View style={styles.tagsRow}>
                    {(item.tags || ['Handwritten']).map((t, idx) => (
                      <View key={idx} style={[styles.tagPill, { backgroundColor: isDark ? '#141D2D' : '#F1F5F9' }]}>
                        <Text style={[styles.tagText, { color: isDark ? '#CBD5E1' : '#475569' }]}>#{t}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Footer Row */}
                  <View style={styles.cardFooter}>
                    <View style={styles.uploaderCol}>
                      <Text style={[styles.uploaderText, { color: textTitle }]}>Uploaded by {item.uploadedBy || 'Scholar'}</Text>
                      <Text style={[styles.statsInlineText, { color: textSub }]}>
                        📥 {item.downloads || 0} downloads • ⭐ {item.rating || 5.0} rating
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewPdfBtn}
                      onPress={() => handleViewPdf(item)}
                      activeOpacity={0.85}
                    >
                      <Icon name="file-text" size={13} color="#0c0f10" style={{ marginRight: 6 }} />
                      <Text style={styles.viewPdfBtnText}>View PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* RIGHT COLUMN: Popular Subjects & Contributors Widgets */}
        <View style={styles.rightCol}>
          {/* Popular Subjects */}
          <View style={[styles.widgetCard, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={[styles.widgetTitle, { color: textTitle }]}>Popular Subjects</Text>
            <View style={styles.widgetList}>
              {POPULAR_SUBJECTS.map((s, idx) => (
                <View key={idx} style={[styles.widgetRow, { borderBottomColor: border }]}>
                  <Text style={[styles.widgetName, { color: textTitle }]}>{s.name}</Text>
                  <Text style={[styles.widgetCount, { color: isDark ? '#f0d074' : '#b8943e' }]}>{s.count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top Contributors */}
          <View style={[styles.widgetCard, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={[styles.widgetTitle, { color: textTitle }]}>Top Contributors</Text>
            <View style={styles.widgetList}>
              {TOP_CONTRIBUTORS.map((c, idx) => (
                <View key={idx} style={[styles.widgetRow, { borderBottomColor: border }]}>
                  <View>
                    <Text style={[styles.widgetName, { color: textTitle }]}>{c.name}</Text>
                    <Text style={[styles.widgetSub, { color: textSub }]}>{c.branch}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.widgetCount, { color: '#34D399' }]}>{c.uploads}</Text>
                    <Text style={{ color: '#FBBF24', fontSize: 10, fontWeight: '700' }}>{c.rating}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Upload Notes Promo */}
          <View style={styles.uploadPromoCard}>
            <Text style={{ fontSize: 24, marginBottom: 6 }}>🎁</Text>
            <Text style={styles.uploadPromoTitle}>Earn Campus Credits by sharing notes!</Text>
            <Text style={styles.uploadPromoSub}>Get 50 Campus Credits for every verified study note uploaded.</Text>
            <TouchableOpacity style={styles.uploadPromoBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.uploadPromoBtnText}>+ Upload Note Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* UPLOAD NOTE MODAL                                     */}
      {/* ======================================================== */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textTitle }]}>Publish Study Note 📚</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={18} color={textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: textSub }]}>Note Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. ADA Complete Handwritten Notes & PYQs"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Subject Name *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. Algorithms & Complexity"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={subject}
                onChangeText={setSubject}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: textSub }]}>Faculty</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                    placeholder="Faculty of Engineering (SSIT)"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={branch}
                    onChangeText={setBranch}
                  />
                </View>
                <View style={{ flex: 0.5 }}>
                  <Text style={[styles.fieldLabel, { color: textSub }]}>Semester</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                    placeholder="5"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={semester}
                    onChangeText={setSemester}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: textSub }]}>Description & Units Covered</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                multiline
                numberOfLines={3}
                placeholder="Detail modules, chapters, or solved question papers..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={[styles.fieldLabel, { color: textSub }]}>Tags (comma separated)</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. ADA, Handwritten, Solved PYQs"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={tags}
                onChangeText={setTags}
              />

              {/* Browse File Button */}
              <Text style={[styles.fieldLabel, { color: textSub, marginTop: 12 }]}>Attachment File *</Text>
              <TouchableOpacity
                style={[
                  styles.fileBrowseBtn,
                  {
                    backgroundColor: selectedFileName ? 'rgba(16,185,129,0.15)' : isDark ? '#141D2D' : '#F8FAFC',
                    borderColor: selectedFileName ? '#10B981' : border,
                  },
                ]}
                onPress={handleBrowseFile}
                activeOpacity={0.8}
              >
                <Icon name={selectedFileName ? 'check-circle' : 'folder-plus'} size={18} color={selectedFileName ? '#10B981' : '#c9a84c'} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fileBrowseTitle, { color: selectedFileName ? '#10B981' : textTitle }]}>
                    {selectedFileName || '📁 Browse File to Upload'}
                  </Text>
                  <Text style={[styles.fileBrowseSub, { color: textSub }]}>
                    {selectedFileSize ? `${selectedFileSize} • Ready to upload` : 'Supports .pdf, .docx, .png, .jpg (Max 25MB)'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: textSub, fontWeight: '600', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleUpload} disabled={submitting}>
                  {submitting ? <ActivityIndicator size="small" color="#0c0f10" /> : <Text style={styles.confirmBtnText}>Publish Note →</Text>}
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
  uploadBtn: {
    backgroundColor: '#c9a84c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8.5,
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
  uploadBtnText: { color: '#0c0f10', fontSize: 13, fontWeight: '700' },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 18 },
  statCard: { flex: 1, minWidth: 170, borderRadius: 16, borderWidth: 1, padding: 16, position: 'relative', overflow: 'hidden', minHeight: 120, justifyContent: 'space-between' },
  statGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, top: -40, right: -40 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  statSub: { fontSize: 11 },
  statFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  statIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  /* Filters Box */
  filtersBox: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 18 },
  searchRow: { marginBottom: 10 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 9, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  pillsScroll: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  pillText: { fontSize: 11.5, fontWeight: '600' },
  semPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1 },
  semPillText: { fontSize: 11, fontWeight: '700' },

  /* Two Column Layout */
  splitGrid: { flexDirection: 'column' },
  splitGridRow: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  leftCol: { flex: 1.4, gap: 14 },
  rightCol: { flex: 1, gap: 16 },

  /* Note Card */
  noteCard: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 14 },
  docIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docTypeText: { fontSize: 9.5, fontWeight: '800', marginTop: 2 },
  noteDetailsCol: { flex: 1, justifyContent: 'space-between' },
  badgesRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },

  noteTitle: { fontSize: 15, fontWeight: '800', lineHeight: 20, marginVertical: 4 },
  noteSubject: { fontSize: 11.5, fontWeight: '700', marginBottom: 6 },
  noteDesc: { fontSize: 12, lineHeight: 17, marginBottom: 8 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tagPill: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 5 },
  tagText: { fontSize: 10.5, fontWeight: '600' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  uploaderCol: { gap: 1 },
  uploaderText: { fontSize: 11.5, fontWeight: '700' },
  statsInlineText: { fontSize: 10.5 },

  viewPdfBtn: { backgroundColor: '#c9a84c', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  viewPdfBtnText: { color: '#0c0f10', fontSize: 12, fontWeight: '700' },

  /* Widgets */
  widgetCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  widgetTitle: { fontSize: 14.5, fontWeight: '800', marginBottom: 12 },
  widgetList: { gap: 8 },
  widgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  widgetName: { fontSize: 12.5, fontWeight: '600' },
  widgetSub: { fontSize: 10.5, marginTop: 1 },
  widgetCount: { fontSize: 11.5, fontWeight: '700' },

  uploadPromoCard: { backgroundColor: '#16140d', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', padding: 18, alignItems: 'center' },
  uploadPromoTitle: { color: '#FFF', fontSize: 13.5, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  uploadPromoSub: { color: '#d9d2c3', fontSize: 11.5, textAlign: 'center', lineHeight: 16, marginBottom: 12 },
  uploadPromoBtn: { backgroundColor: '#c9a84c', paddingHorizontal: 14, paddingVertical: 7.5, borderRadius: 8 },
  uploadPromoBtnText: { color: '#0c0f10', fontSize: 12, fontWeight: '700' },

  /* Modals */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', maxWidth: 500, borderRadius: 18, borderWidth: 1, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  modalInput: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8.5, fontSize: 13 },
  modalTextArea: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8.5, fontSize: 13, minHeight: 70, textAlignVertical: 'top' },
  fileBrowseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginTop: 4,
    marginBottom: 6,
  },
  fileBrowseTitle: { fontSize: 13, fontWeight: '700' },
  fileBrowseSub: { fontSize: 10.5, marginTop: 2 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, borderWidth: 1, alignItems: 'center' },
  confirmBtn: { flex: 2, backgroundColor: '#c9a84c', paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  confirmBtnText: { color: '#0c0f10', fontSize: 13, fontWeight: '700' },
});
