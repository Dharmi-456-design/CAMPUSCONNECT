import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import Icon from '../components/common/Icon';
import { getNotesApi } from '../api/notes.api';
import NoteEditorScreen from './notes/NoteEditorScreen';
import NoteDetailsScreen from './notes/NoteDetailsScreen';

export default function NotesScreen({
  initialSubjectId = null,
  initialSubjectName = null,
  onNavigateTab = null,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  // View state: 'list' | 'details' | 'create' | 'edit'
  const [currentView, setCurrentView] = useState(
    initialSubjectId ? 'create' : 'list'
  );
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pinned' | 'locked'

  const fetchNotes = useCallback(async (search = '', filter = 'all') => {
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (filter === 'pinned') params.isPinned = true;
      if (filter === 'locked') params.isLocked = true;

      const res = await getNotesApi(params);
      setNotes(res.data?.notes || []);
    } catch (err) {
      // Keep existing list on transient network error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(searchQuery, activeFilter);
  }, [fetchNotes, searchQuery, activeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes(searchQuery, activeFilter);
  };

  const handleOpenNote = (note) => {
    setSelectedNote(note);
    setCurrentView('details');
  };

  const handleStartCreate = () => {
    setSelectedNote(null);
    setCurrentView('create');
  };

  const handleStartEdit = (note) => {
    setSelectedNote(note);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setSelectedNote(null);
    setCurrentView('list');
    fetchNotes(searchQuery, activeFilter);
  };

  // Render Note Editor (Create or Edit)
  if (currentView === 'create' || currentView === 'edit') {
    return (
      <NoteEditorScreen
        initialNote={currentView === 'edit' ? selectedNote : null}
        preselectedSubject={
          initialSubjectId
            ? { _id: initialSubjectId, name: initialSubjectName || 'Subject' }
            : null
        }
        onBack={handleBackToList}
        onSaveSuccess={() => {
          fetchNotes(searchQuery, activeFilter);
        }}
      />
    );
  }

  // Render Note Details
  if (currentView === 'details' && selectedNote) {
    return (
      <NoteDetailsScreen
        note={selectedNote}
        onBack={handleBackToList}
        onEdit={handleStartEdit}
        onNoteDeleted={() => {
          fetchNotes(searchQuery, activeFilter);
        }}
      />
    );
  }

  // Filter notes in memory as extra safety
  const displayedNotes = notes.filter((n) => {
    if (activeFilter === 'pinned') return n.isPinned;
    if (activeFilter === 'locked') return n.isLocked;
    return true;
  });

  return (
    <View style={styles.root}>
      {/* Top Header matching reference (media_1794714942597_29fca6f3.png) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.profileIconBox}
            onPress={() => onNavigateTab && onNavigateTab('profile')}
            activeOpacity={0.7}
          >
            <Icon name="user" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addNoteBtn}
            onPress={handleStartCreate}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search notes rounded bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes"
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

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            All Notes ({notes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'pinned' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('pinned')}
        >
          <Icon
            name="pin"
            size={12}
            color={activeFilter === 'pinned' ? '#FFFFFF' : '#64748B'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'pinned' && styles.filterChipTextActive,
            ]}
          >
            Pinned
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'locked' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('locked')}
        >
          <Icon
            name="lock"
            size={12}
            color={activeFilter === 'locked' ? '#FFFFFF' : '#64748B'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'locked' && styles.filterChipTextActive,
            ]}
          >
            Private
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes List matching reference screenshot cards */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your private notes...</Text>
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
              colors={['#2563EB', '#16A36A']}
            />
          }
        >
          {displayedNotes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="file-text" size={42} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No notes found</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? `No notes matching "${searchQuery}"`
                  : 'Start capturing your thoughts, coursework, and private study notes.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={handleStartCreate}
              >
                <Icon name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyCreateBtnText}>Create Note</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsGroup}>
              {displayedNotes.map((note) => {
                const noteDate = new Date(note.createdAt || Date.now()).toLocaleDateString(
                  'en-US',
                  {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                  }
                );

                const previewText =
                  note.isLocked && !note.content
                    ? 'Locked Note'
                    : note.content || note.description || 'No additional text';

                return (
                  <TouchableOpacity
                    key={note._id}
                    style={styles.noteCard}
                    onPress={() => handleOpenNote(note)}
                    activeOpacity={0.7}
                  >
                    {/* Top Row: Title + Date */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardTitleContainer}>
                        {note.isPinned ? (
                          <Icon
                            name="pin"
                            size={14}
                            color="#16A36A"
                            style={{ marginRight: 6 }}
                          />
                        ) : null}
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {note.title}
                        </Text>
                      </View>
                      <Text style={styles.cardDate}>{noteDate}</Text>
                    </View>

                    {/* Subtitle / Preview Snippet */}
                    <View style={styles.cardSubtitleRow}>
                      {note.isLocked ? (
                        <Icon
                          name="lock"
                          size={13}
                          color="#64748B"
                          style={{ marginRight: 6 }}
                        />
                      ) : null}
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {previewText}
                      </Text>
                    </View>

                    {/* Subject Tag badge */}
                    {note.subjectName && note.subjectName !== 'General' ? (
                      <View style={styles.subjectBadge}>
                        <Text style={styles.subjectBadgeText}>
                          {note.subjectName}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNoteBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  desktopContainer: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  cardsGroup: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 8,
  },
  subjectBadgeText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
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
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 18,
  },
  emptyCreateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
