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
  Platform,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { updateProfileApi } from '../../api/auth.api';

export default function ManageAccountModal({
  visible,
  currentUser,
  onClose,
  onProfileUpdated,
  isDark,
  theme,
}) {
  const [name, setName] = useState(currentUser?.name || '');
  const [college, setCollege] = useState(currentUser?.college || 'Swaminarayan University, Kalol');
  const [branch, setBranch] = useState(currentUser?.branch || 'Computer Engineering');
  const [semester, setSemester] = useState(String(currentUser?.semester || '3'));
  const [rollNumber, setRollNumber] = useState(currentUser?.rollNumber || 'SSIT2023CE047');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        college: college.trim(),
        branch: branch.trim(),
        semester: Number(semester) || 1,
        rollNumber: rollNumber.trim(),
        bio: bio.trim(),
      };

      const res = await updateProfileApi(payload);
      if (res.success && res.data?.user) {
        if (onProfileUpdated) onProfileUpdated(res.data.user);
        Alert.alert('Success 🎉', 'Profile information updated successfully!');
        onClose();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="x" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Manage Account
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Full Name */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#94A3B8' : '#475569' }]}>
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Dharmi Patel"
              placeholderTextColor="#94A3B8"
            />

            {/* University */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#94A3B8' : '#475569' }]}>
              University / Institute
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                },
              ]}
              value={college}
              onChangeText={setCollege}
              placeholder="Institute name"
              placeholderTextColor="#94A3B8"
            />

            {/* Department / Branch */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#94A3B8' : '#475569' }]}>
              Branch / Program
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                },
              ]}
              value={branch}
              onChangeText={setBranch}
              placeholder="e.g. Computer Engineering"
              placeholderTextColor="#94A3B8"
            />

            {/* Semester & Roll Number Row */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#94A3B8' : '#475569' }]}>
                  Semester
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    },
                  ]}
                  value={semester}
                  onChangeText={setSemester}
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={{ flex: 1.5 }}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#94A3B8' : '#475569' }]}>
                  Enrollment / Roll No.
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    },
                  ]}
                  value={rollNumber}
                  onChangeText={setRollNumber}
                  placeholder="SSIT2023CE047"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Bio */}
            <Text style={[styles.fieldLabel, { color: isDark ? '#94A3B8' : '#475569' }]}>
              About & Bio
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                },
              ]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholder="Tell other students about your interests, technical skills or goals..."
              placeholderTextColor="#94A3B8"
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 22,
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
