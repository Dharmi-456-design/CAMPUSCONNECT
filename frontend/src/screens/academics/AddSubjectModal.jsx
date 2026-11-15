import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { createSubjectApi, updateSubjectApi } from '../../api/subjects.api';

const COLOR_PALETTE = [
  '#F59E0B', // Amber / Orange
  '#EF4444', // Red
  '#EAB308', // Yellow
  '#84CC16', // Lime Green
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export default function AddSubjectModal({
  visible,
  onClose,
  onSubjectSaved,
  initialSubject = null,
}) {
  const isEditing = Boolean(initialSubject && initialSubject._id);

  const [code, setCode] = useState(initialSubject?.code || '');
  const [name, setName] = useState(initialSubject?.name || '');
  const [credits, setCredits] = useState(String(initialSubject?.credits || '1'));
  const [semester, setSemester] = useState(String(initialSubject?.semester || '6'));
  const [department, setDepartment] = useState(initialSubject?.department || 'Computer Science');
  const [instructor, setInstructor] = useState(initialSubject?.instructor || '');
  const [grade, setGrade] = useState(initialSubject?.grade || 'A');
  const [color, setColor] = useState(initialSubject?.color || '#F59E0B');
  const [category, setCategory] = useState(initialSubject?.category || 'my_subjects');
  const [description, setDescription] = useState(initialSubject?.description || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form when modal opens with new/null subject
  React.useEffect(() => {
    if (visible) {
      if (initialSubject) {
        setCode(initialSubject.code || '');
        setName(initialSubject.name || '');
        setCredits(String(initialSubject.credits || '1'));
        setSemester(String(initialSubject.semester || '6'));
        setDepartment(initialSubject.department || 'Computer Science');
        setInstructor(initialSubject.instructor || '');
        setGrade(initialSubject.grade || 'A');
        setColor(initialSubject.color || '#F59E0B');
        setCategory(initialSubject.category || 'my_subjects');
        setDescription(initialSubject.description || '');
      } else {
        setCode('');
        setName('');
        setCredits('1');
        setSemester('6');
        setDepartment('Computer Science');
        setInstructor('');
        setGrade('A');
        setColor('#F59E0B');
        setCategory('my_subjects');
        setDescription('');
      }
      setErrorMsg('');
    }
  }, [visible, initialSubject]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setErrorMsg('Please enter a subject code (e.g. BUS 138)');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter a subject name (e.g. Coding)');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      credits: parseInt(credits, 10) || 1,
      semester: parseInt(semester, 10) || 1,
      department: department.trim() || 'General',
      instructor: instructor.trim(),
      grade: grade.trim() || 'A',
      color,
      category,
      description: description.trim(),
    };

    try {
      let savedSubject;
      if (isEditing) {
        const res = await updateSubjectApi(initialSubject._id, payload);
        savedSubject = res.data?.subject;
      } else {
        const res = await createSubjectApi(payload);
        savedSubject = res.data?.subject;
      }

      onSubjectSaved(savedSubject);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save subject';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Subject' : 'Add New Subject'}
              </Text>
              <Text style={styles.modalSub}>
                Organize your coursework & academic progress
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <ScrollView
            style={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Category Toggle */}
            <Text style={styles.label}>SECTION</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  category === 'my_subjects' && styles.toggleBtnActive,
                ]}
                onPress={() => setCategory('my_subjects')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    category === 'my_subjects' && styles.toggleBtnTextActive,
                  ]}
                >
                  My Subjects
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  category === 'main_hub' && styles.toggleBtnActive,
                ]}
                onPress={() => setCategory('main_hub')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    category === 'main_hub' && styles.toggleBtnTextActive,
                  ]}
                >
                  Main Hub
                </Text>
              </TouchableOpacity>
            </View>

            {/* Subject Code & Name */}
            <Text style={styles.label}>SUBJECT CODE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. BUS 138, CS301, MTH101"
              placeholderTextColor="#94A3B8"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>SUBJECT NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Coding, World History A, Calculus"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            {/* Credits & Grade */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>CREDITS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1, 3, 4"
                  placeholderTextColor="#94A3B8"
                  value={credits}
                  onChangeText={setCredits}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>GRADE / SCORE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. A, 87.5%, A-"
                  placeholderTextColor="#94A3B8"
                  value={grade}
                  onChangeText={setGrade}
                />
              </View>
            </View>

            {/* Department & Instructor */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>DEPARTMENT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  placeholderTextColor="#94A3B8"
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>INSTRUCTOR</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dr. Budi Santoso"
                  placeholderTextColor="#94A3B8"
                  value={instructor}
                  onChangeText={setInstructor}
                />
              </View>
            </View>

            {/* Color Badge Palette */}
            <Text style={styles.label}>THEME COLOR BADGE</Text>
            <View style={styles.colorRow}>
              {COLOR_PALETTE.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    color === c && styles.colorCircleSelected,
                  ]}
                  onPress={() => setColor(c)}
                  activeOpacity={0.8}
                >
                  {color === c ? (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.label}>DESCRIPTION / SYLLABUS NOTES</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add key topics, room numbers, or exam schedule..."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>
                    {isEditing ? 'Save Changes' : 'Create Subject'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  scrollBody: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 6,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#16A36A',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#16A36A',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
