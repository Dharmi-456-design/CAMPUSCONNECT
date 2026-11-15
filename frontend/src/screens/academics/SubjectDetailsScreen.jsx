import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { getSubjectByIdApi, deleteSubjectApi } from '../../api/subjects.api';
import { getNotesApi } from '../../api/notes.api';
import AddSubjectModal from './AddSubjectModal';

export default function SubjectDetailsScreen({
  subjectId,
  onBack,
  onNavigateToNote,
  onCreateNoteForSubject,
  onSubjectDeleted,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjectData = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getSubjectByIdApi(subjectId);
      const subDoc = res.data?.subject;
      setSubject(subDoc);

      // Also fetch private notes for this subject
      const notesRes = await getNotesApi({ subject: subjectId });
      setNotes(notesRes.data?.notes || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load subject details');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSubjectData();
  }, [fetchSubjectData]);

  const handleDelete = () => {
    const confirmDelete = async () => {
      setDeleting(true);
      try {
        await deleteSubjectApi(subjectId);
        if (onSubjectDeleted) onSubjectDeleted(subjectId);
        onBack();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete subject';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Error', msg);
        }
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete ${subject?.name} (${subject?.code})?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Subject',
        `Are you sure you want to delete ${subject?.name} (${subject?.code})?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16A36A" />
        <Text style={styles.loadingText}>Loading subject coursework...</Text>
      </View>
    );
  }

  if (errorMsg || !subject) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-triangle" size={40} color="#EF4444" />
        <Text style={styles.errorTitle}>Subject Not Found</Text>
        <Text style={styles.errorSub}>{errorMsg || 'The requested subject is not available.'}</Text>
        <TouchableOpacity style={styles.backBtnSolid} onPress={onBack}>
          <Text style={styles.backBtnSolidText}>Back to Subjects</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subjectColor = subject.color || '#10B981';

  return (
    <View style={styles.root}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color="#0F172A" />
          <Text style={styles.topBarBtnText}>Subjects</Text>
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.7}
          >
            <Icon name="edit-2" size={15} color="#16A36A" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Icon name="trash-2" size={15} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, isDesktop && styles.desktopContainer]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadgeRow}>
              <View style={[styles.colorDot, { backgroundColor: subjectColor }]} />
              <Text style={styles.subjectCode}>{subject.code}</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {subject.category === 'main_hub' ? 'Main Hub' : 'My Subjects'}
                </Text>
              </View>
            </View>

            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>{subject.grade || 'A'}</Text>
            </View>
          </View>

          <Text style={styles.subjectName}>{subject.name}</Text>

          {subject.description ? (
            <Text style={styles.subjectDesc}>{subject.description}</Text>
          ) : null}

          {/* Key Metrics Row */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Icon name="award" size={16} color="#16A36A" />
              <Text style={styles.metricValue}>{subject.credits} Credits</Text>
              <Text style={styles.metricLabel}>Credit Load</Text>
            </View>

            <View style={styles.metricItem}>
              <Icon name="calendar" size={16} color="#3B82F6" />
              <Text style={styles.metricValue}>Semester {subject.semester || 1}</Text>
              <Text style={styles.metricLabel}>Current Term</Text>
            </View>

            <View style={styles.metricItem}>
              <Icon name="book-open" size={16} color="#F59E0B" />
              <Text style={styles.metricValue}>{notes.length} Notes</Text>
              <Text style={styles.metricLabel}>Private Notes</Text>
            </View>
          </View>

          {/* Department & Instructor Info */}
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="layers" size={16} color="#64748B" />
              </View>
              <View style={styles.detailMeta}>
                <Text style={styles.detailLabel}>Department</Text>
                <Text style={styles.detailValue}>
                  {subject.department || 'Computer Science & Engineering'}
                </Text>
              </View>
            </View>

            {subject.instructor ? (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="user" size={16} color="#64748B" />
                </View>
                <View style={styles.detailMeta}>
                  <Text style={styles.detailLabel}>Instructor / Lecturer</Text>
                  <Text style={styles.detailValue}>{subject.instructor}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Associated Notes Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Course Notes & Study Material</Text>
            <Text style={styles.sectionSub}>
              {notes.length} private note{notes.length === 1 ? '' : 's'} linked to {subject.code}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addNoteBtn}
            onPress={() => onCreateNoteForSubject && onCreateNoteForSubject(subject)}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addNoteBtnText}>Add Note</Text>
          </TouchableOpacity>
        </View>

        {notes.length === 0 ? (
          <View style={styles.emptyNotesCard}>
            <Icon name="file-text" size={36} color="#CBD5E1" />
            <Text style={styles.emptyNotesTitle}>No notes for this subject yet</Text>
            <Text style={styles.emptyNotesSub}>
              Capture formulas, lecture summaries, or exam reminders for {subject.name}.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => onCreateNoteForSubject && onCreateNoteForSubject(subject)}
            >
              <Text style={styles.emptyAddBtnText}>+ Create First Note</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.notesList}>
            {notes.map((note) => (
              <TouchableOpacity
                key={note._id}
                style={styles.noteItemCard}
                onPress={() => onNavigateToNote && onNavigateToNote(note)}
                activeOpacity={0.7}
              >
                <View style={styles.noteItemHeader}>
                  <View style={styles.noteTitleRow}>
                    {note.isPinned ? (
                      <Icon name="pin" size={14} color="#16A36A" style={{ marginRight: 6 }} />
                    ) : null}
                    {note.isLocked ? (
                      <Icon name="lock" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    ) : null}
                    <Text style={styles.noteItemTitle} numberOfLines={1}>
                      {note.title}
                    </Text>
                  </View>
                  <Text style={styles.noteItemDate}>
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.noteItemDesc} numberOfLines={2}>
                  {note.content || note.description || 'No additional text'}
                </Text>

                {note.tags && note.tags.length > 0 ? (
                  <View style={styles.tagsRow}>
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <View key={idx} style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Subject Modal */}
      <AddSubjectModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialSubject={subject}
        onSubjectSaved={(updatedSub) => {
          setSubject(updatedSub);
          fetchSubjectData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  editBtn: {
    backgroundColor: '#E8F5EE',
  },
  editBtnText: {
    color: '#16A36A',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  desktopContainer: {
    maxWidth: 840,
    alignSelf: 'center',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  errorSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  backBtnSolid: {
    marginTop: 20,
    backgroundColor: '#16A36A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnSolidText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sectionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  gradeBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  gradeBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A36A',
  },
  subjectName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subjectDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginVertical: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  detailsList: {
    marginTop: 8,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailMeta: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A36A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addNoteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyNotesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyNotesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyNotesSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },
  emptyAddBtn: {
    marginTop: 14,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A36A',
  },
  notesList: {
    gap: 12,
  },
  noteItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  noteItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  noteItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  noteItemDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  noteItemDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
});
