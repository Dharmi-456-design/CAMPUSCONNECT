import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { createPostApi } from '../../api/community.api';

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Analysis & Design of Algorithms',
  'Computer Networks',
  'Database Management Systems',
  'Physical Pharmaceutics',
  'Pharmaceutical Chemistry',
  'Operating Systems',
  'Software Engineering',
  'General Academic',
];

export default function CreatePostModal({
  visible,
  currentUser,
  onClose,
  onPostCreated,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Question');
  const [helpType, setHelpType] = useState('community'); // 'community' or 'tutor'

  // Step modal: 'form' or 'targetSelector'
  const [showTargetSheet, setShowTargetSheet] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInitialAsk = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title or question topic');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Required', 'Please enter your question details');
      return;
    }
    // Open target sheet matching reference screenshot 2
    setShowTargetSheet(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        content: content.trim(),
        subject: subject.trim(),
        category,
        helpType,
      };

      const res = await createPostApi(payload);
      Alert.alert('Success', 'Your question has been posted to the campus hub!');
      // Reset
      setTitle('');
      setContent('');
      setSubject('');
      setShowTargetSheet(false);
      if (onPostCreated) onPostCreated(res.data);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Header matching reference */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Icon name="x" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ask question</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Subject Selector Pill matching reference screenshot */}
            <View style={styles.subjectRow}>
              {subject ? (
                <TouchableOpacity
                  style={styles.selectedSubjectPill}
                  onPress={() => setShowSubjectPicker(true)}
                >
                  <Icon name="book" size={14} color="#16A36A" />
                  <Text style={styles.selectedSubjectText}>{subject}</Text>
                  <Icon name="edit-2" size={12} color="#64748B" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addSubjectPill}
                  onPress={() => setShowSubjectPicker(true)}
                >
                  <Icon name="plus" size={14} color="#0F172A" />
                  <Text style={styles.addSubjectText}>SUBJECT</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Subject Picker Dropdown Modal */}
            {showSubjectPicker && (
              <View style={styles.pickerBox}>
                <Text style={styles.pickerTitle}>Select Subject:</Text>
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSubject(sub);
                      setShowSubjectPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{sub}</Text>
                    {subject === sub && (
                      <Icon name="check" size={16} color="#16A36A" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Question Title Input */}
            <TextInput
              style={styles.titleInput}
              placeholder="Question Title or Topic..."
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            {/* Content Textarea */}
            <TextInput
              style={styles.contentTextarea}
              placeholder="Type your question in detail... e.g. What is the key difference between Dijkstra and Bellman-Ford?"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={8}
              value={content}
              onChangeText={setContent}
            />

            {/* Attachment & Action Bottom Bar matching screenshot 2 */}
            <View style={styles.bottomBar}>
              <View style={styles.attachmentIcons}>
                <TouchableOpacity style={styles.mediaIconBtn}>
                  <Icon name="camera" size={20} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaIconBtn}>
                  <Icon name="image" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.askQuestionBtn}
                onPress={handleInitialAsk}
                activeOpacity={0.85}
              >
                <Text style={styles.askQuestionBtnText}>ASK QUESTION</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Sheet Modal matching reference screenshot 2: "Who do you wanna ask for help?" */}
          <Modal
            visible={showTargetSheet}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTargetSheet(false)}
          >
            <View style={styles.sheetOverlay}>
              <View style={styles.sheetBox}>
                <View style={styles.sheetHeaderRow}>
                  <Text style={styles.sheetTitle}>Who do you wanna ask for help?</Text>
                  <TouchableOpacity
                    onPress={() => setShowTargetSheet(false)}
                    style={styles.sheetCloseBtn}
                  >
                    <Icon name="x" size={18} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                {/* Option 1: Ask Tutor */}
                <TouchableOpacity
                  style={[
                    styles.targetCard,
                    helpType === 'tutor' && styles.targetCardActive,
                  ]}
                  onPress={() => setHelpType('tutor')}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={{ fontSize: 18 }}>👨‍🏫</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.targetTitle}>Ask Tutor</Text>
                    <Text style={styles.targetSub}>
                      Chat with the Tutor directly and get help in real-time
                    </Text>
                  </View>
                  {helpType === 'tutor' && (
                    <Icon name="check-circle" size={20} color="#16A36A" />
                  )}
                </TouchableOpacity>

                {/* Option 2: Ask Community */}
                <TouchableOpacity
                  style={[
                    styles.targetCard,
                    helpType === 'community' && styles.targetCardActive,
                  ]}
                  onPress={() => setHelpType('community')}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={{ fontSize: 18 }}>👥</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.targetTitle}>Ask Community</Text>
                    <Text style={styles.targetSub}>
                      Community help in under 20 mins from fellow students
                    </Text>
                  </View>
                  {helpType === 'community' && (
                    <Icon name="check-circle" size={20} color="#16A36A" />
                  )}
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.finalSubmitBtn}
                  onPress={handleFinalSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.finalSubmitBtnText}>ASK YOUR QUESTION</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addSubjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  addSubjectText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  selectedSubjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#16A36A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  selectedSubjectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  pickerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#0F172A',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    marginBottom: 14,
  },
  contentTextarea: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    minHeight: 180,
    textAlignVertical: 'top',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginTop: 20,
  },
  attachmentIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mediaIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  askQuestionBtn: {
    backgroundColor: '#93C5FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  askQuestionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  // Sheet modal
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 14,
  },
  targetCardActive: {
    borderColor: '#16A36A',
    backgroundColor: '#F0FDF4',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  targetSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  finalSubmitBtn: {
    backgroundColor: '#16A36A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  finalSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
