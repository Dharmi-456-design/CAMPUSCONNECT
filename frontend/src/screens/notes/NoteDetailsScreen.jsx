import React, { useState } from 'react';
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
import { deleteNoteApi, toggleBookmarkApi } from '../../api/notes.api';

export default function NoteDetailsScreen({
  note,
  onBack,
  onEdit,
  onNoteDeleted,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [deleting, setDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!note) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Note not found</Text>
        <TouchableOpacity style={styles.backBtnSolid} onPress={onBack}>
          <Text style={styles.backBtnSolidText}>Back to Notes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    const doDelete = async () => {
      setDeleting(true);
      try {
        await deleteNoteApi(note._id);
        if (onNoteDeleted) onNoteDeleted(note._id);
        onBack();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete note';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Note',
        `Are you sure you want to delete "${note.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await toggleBookmarkApi(note._id);
      setIsBookmarked(res.data?.isBookmarked || !isBookmarked);
    } catch (e) {
      setIsBookmarked(!isBookmarked);
    }
  };

  const createdDate = new Date(note.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.root}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color="#2563EB" />
          <Text style={styles.topBackText}>Notes</Text>
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleToggleBookmark}
            activeOpacity={0.7}
          >
            <Icon
              name="bookmark"
              size={18}
              color={isBookmarked ? '#16A36A' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => onEdit && onEdit(note)}
            activeOpacity={0.7}
          >
            <Icon name="edit-2" size={14} color="#16A36A" />
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
                <Icon name="trash-2" size={14} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, isDesktop && styles.desktopContainer]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleRow}>
          {note.isPinned ? (
            <View style={styles.pinnedBadge}>
              <Icon name="pin" size={14} color="#16A36A" />
              <Text style={styles.pinnedText}>Pinned</Text>
            </View>
          ) : null}

          {note.isLocked ? (
            <View style={styles.lockedBadge}>
              <Icon name="lock" size={14} color="#64748B" />
              <Text style={styles.lockedText}>Private</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.noteTitle}>{note.title}</Text>

        {/* Metadata Badges */}
        <View style={styles.metaRow}>
          <View style={styles.subjectPill}>
            <View style={styles.subjectDot} />
            <Text style={styles.subjectPillText}>
              {note.subject?.name || note.subjectName || 'General'}
            </Text>
          </View>

          <Text style={styles.dateText}>Created {createdDate}</Text>
        </View>

        {/* Tags */}
        {note.tags && note.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {note.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Icon name="tag" size={11} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.tagBadgeText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* Content Body */}
        <Text style={styles.contentBody}>
          {note.content || note.description || 'No additional text in this note.'}
        </Text>

        {/* Character count footer */}
        <View style={styles.contentFooter}>
          <Text style={styles.charCountText}>
            {(note.content || '').length.toLocaleString()} characters
          </Text>
          <Text style={styles.privacyNote}>
            • Only visible to you
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBackText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  editBtn: {
    backgroundColor: '#E8F5EE',
  },
  editBtnText: {
    color: '#16A36A',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
  },
  desktopContainer: {
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backBtnSolid: {
    backgroundColor: '#16A36A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnSolidText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  pinnedText: {
    fontSize: 11,
    color: '#16A36A',
    fontWeight: '700',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  lockedText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  noteTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A36A',
    marginRight: 6,
  },
  subjectPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  contentBody: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1E293B',
    minHeight: 180,
  },
  contentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  charCountText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  privacyNote: {
    fontSize: 12,
    color: '#16A36A',
    fontWeight: '500',
  },
});
