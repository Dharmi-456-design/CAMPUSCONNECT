import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { createNoteApi, updateNoteApi } from '../../api/notes.api';
import { getSubjectsApi } from '../../api/subjects.api';

export default function NoteEditorScreen({
  initialNote = null,
  preselectedSubject = null,
  onBack,
  onSaveSuccess,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isEditing = Boolean(initialNote && initialNote._id);

  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    initialNote?.subject?._id || initialNote?.subject || preselectedSubject?._id || ''
  );
  const [selectedSubjectName, setSelectedSubjectName] = useState(
    initialNote?.subjectName || preselectedSubject?.name || 'General'
  );
  const [isPinned, setIsPinned] = useState(Boolean(initialNote?.isPinned));
  const [isLocked, setIsLocked] = useState(Boolean(initialNote?.isLocked));
  const [tags, setTags] = useState(initialNote?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch student's subjects to select from
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getSubjectsApi();
        if (isMounted) {
          setAvailableSubjects(res.data?.subjects || []);
        }
      } catch (e) {
        // Fallback
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleInsertBullet = () => {
    setContent((prev) => (prev ? `${prev}\n• ` : '• '));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a note title');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const payload = {
      title: title.trim(),
      content,
      description: content ? content.slice(0, 160) : 'No additional text',
      subject: selectedSubjectId || null,
      subjectName: selectedSubjectName || 'General',
      tags,
      isPinned,
      isLocked,
      color: '#16A36A',
    };

    try {
      let savedNote;
      if (isEditing) {
        const res = await updateNoteApi(initialNote._id, payload);
        savedNote = res.data?.note;
      } else {
        const res = await createNoteApi(payload);
        savedNote = res.data?.note;
      }

      if (onSaveSuccess) onSaveSuccess(savedNote);
      onBack();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save note';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const characterCount = content.length;

  return (
    <View style={styles.root}>
      {/* Top Header matching reference (media_1794714944972_d73102ce.jpg) */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Icon name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, isDesktop && styles.desktopContainer]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
        />

        {/* Tags & Metadata Row matching reference */}
        <View style={styles.metadataRow}>
          {/* Subject / Category Pill */}
          <TouchableOpacity
            style={styles.categoryPill}
            onPress={() => setShowSubjectPicker(!showSubjectPicker)}
            activeOpacity={0.7}
          >
            <View style={styles.blueDot} />
            <Text style={styles.categoryPillText}>{selectedSubjectName}</Text>
            <Icon name="chevron-down" size={12} color="#64748B" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Star / Pin Button */}
          <TouchableOpacity
            style={[styles.metaIconBtn, isPinned && styles.metaIconBtnActive]}
            onPress={() => setIsPinned(!isPinned)}
            activeOpacity={0.7}
          >
            <Icon
              name="star"
              size={16}
              color={isPinned ? '#F59E0B' : '#64748B'}
            />
          </TouchableOpacity>

          {/* Lock Button */}
          <TouchableOpacity
            style={[styles.metaIconBtn, isLocked && styles.metaIconBtnActive]}
            onPress={() => setIsLocked(!isLocked)}
            activeOpacity={0.7}
          >
            <Icon
              name="lock"
              size={16}
              color={isLocked ? '#16A36A' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        {/* Subject Picker Dropdown */}
        {showSubjectPicker ? (
          <View style={styles.subjectPickerDropdown}>
            <Text style={styles.pickerHeading}>Select Subject</Text>
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setSelectedSubjectId('');
                setSelectedSubjectName('General');
                setShowSubjectPicker(false);
              }}
            >
              <Text style={styles.pickerItemText}>• General</Text>
            </TouchableOpacity>

            {availableSubjects.map((sub) => (
              <TouchableOpacity
                key={sub._id}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedSubjectId(sub._id);
                  setSelectedSubjectName(sub.name);
                  setShowSubjectPicker(false);
                }}
              >
                <View style={[styles.subColorDot, { backgroundColor: sub.color || '#10B981' }]} />
                <Text style={styles.pickerItemText}>
                  {sub.code} - {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Tags Row matching reference pills */}
        <View style={styles.tagsContainer}>
          {tags.map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Icon name="tag" size={12} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.tagPillText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(tag)}
                style={styles.tagRemoveBtn}
              >
                <Icon name="x" size={12} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {showTagInput ? (
            <View style={styles.newTagInputRow}>
              <TextInput
                style={styles.tagTextInput}
                placeholder="tag name"
                placeholderTextColor="#94A3B8"
                value={newTagInput}
                onChangeText={setNewTagInput}
                onSubmitEditing={handleAddTag}
                autoFocus
              />
              <TouchableOpacity style={styles.addTagSmallBtn} onPress={handleAddTag}>
                <Text style={styles.addTagSmallBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addTagPill}
              onPress={() => setShowTagInput(true)}
            >
              <Icon name="plus" size={12} color="#16A36A" />
              <Text style={styles.addTagPillText}>Tag</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Note Body Text Area */}
        <TextInput
          style={styles.bodyInput}
          placeholder="Start typing your private notes, formulas, lecture summaries..."
          placeholderTextColor="#94A3B8"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Bottom Toolbar & Character Counter matching reference */}
      <View style={styles.bottomBar}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity
            style={styles.toolIconBtn}
            onPress={handleInsertBullet}
            activeOpacity={0.7}
          >
            <Icon name="list" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolIconBtn}
            onPress={() => {
              if (Platform.OS === 'web') window.alert('Attachment feature ready.');
              else Alert.alert('Attachment', 'Attachment feature ready.');
            }}
            activeOpacity={0.7}
          >
            <Icon name="image" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolIconBtn}
            onPress={() => setShowTagInput(true)}
            activeOpacity={0.7}
          >
            <Icon name="tag" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolIconBtn}
            onPress={() => {
              if (Platform.OS === 'web') window.alert('Voice note dictation ready.');
              else Alert.alert('Voice Notes', 'Voice note dictation ready.');
            }}
            activeOpacity={0.7}
          >
            <Icon name="mic" size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        <Text style={styles.characterCounter}>
          {characterCount.toLocaleString()} characters
        </Text>
      </View>
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
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 17,
    color: '#2563EB',
    fontWeight: '500',
  },
  saveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 17,
    color: '#2563EB',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 6,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  desktopContainer: {
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    padding: 0,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  metaIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaIconBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  subjectPickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  pickerHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  subColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  tagRemoveBtn: {
    marginLeft: 6,
    padding: 2,
  },
  addTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  addTagPillText: {
    fontSize: 12,
    color: '#16A36A',
    fontWeight: '600',
  },
  newTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagTextInput: {
    fontSize: 12,
    color: '#0F172A',
    minWidth: 70,
    padding: 2,
  },
  addTagSmallBtn: {
    marginLeft: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#16A36A',
    borderRadius: 8,
  },
  addTagSmallBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bodyInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E293B',
    minHeight: 280,
    padding: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toolIconBtn: {
    padding: 4,
  },
  characterCounter: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
