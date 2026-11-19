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
  Platform,
  Alert,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { getSubjectsApi, deleteSubjectApi } from '../../api/subjects.api';
import AddSubjectModal from './AddSubjectModal';

const DEFAULT_SWAMINARAYAN_SUBJECTS = [
  {
    _id: 'sub_1',
    code: 'CSE-601',
    name: 'Machine Learning & Deep Learning',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Dr. Rajesh Sharma',
    grade: 'AA',
    color: '#10B981',
    category: 'my_subjects',
  },
  {
    _id: 'sub_2',
    code: 'CSE-602',
    name: 'Web Technologies & Cloud Native Architecture',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Harsh Patel',
    grade: 'AA',
    color: '#3B82F6',
    category: 'my_subjects',
  },
  {
    _id: 'sub_3',
    code: 'CSE-603',
    name: 'Compiler Design & Language Translators',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Nidhi Shah',
    grade: 'AB',
    color: '#8B5CF6',
    category: 'my_subjects',
  },
  {
    _id: 'sub_4',
    code: 'CSE-604',
    name: 'Mobile App Development (React Native & Android)',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Sneha Prajapati',
    grade: 'AA',
    color: '#F59E0B',
    category: 'my_subjects',
  },
  {
    _id: 'sub_5',
    code: 'CSE-605',
    name: 'Cyber Security & Cryptography',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Viral Mehta',
    grade: 'AB',
    color: '#EF4444',
    category: 'my_subjects',
  },
  {
    _id: 'sub_6',
    code: 'CSE-606',
    name: 'Software Testing & Quality Assurance',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Bhavin Joshi',
    grade: 'AA',
    color: '#06B6D4',
    category: 'my_subjects',
  },
  {
    _id: 'sub_7',
    code: 'CSE-607',
    name: 'Cloud Computing & DevOps Architecture',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Dr. Alok Verma',
    grade: 'AA',
    color: '#6366F1',
    category: 'main_hub',
  },
  {
    _id: 'sub_8',
    code: 'CSE-608',
    name: 'Artificial Intelligence & Robotics',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Pooja Trivedi',
    grade: 'AA',
    color: '#EC4899',
    category: 'main_hub',
  },
];

export default function SubjectListScreen({
  onSelectSubject,
  onNavigateToProfile,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [subjects, setSubjects] = useState(DEFAULT_SWAMINARAYAN_SUBJECTS);
  const [gpa, setGpa] = useState('8.92');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const fetchSubjects = useCallback(async (search = '') => {
    try {
      const res = await getSubjectsApi({ search });
      const data = res.data || {};
      if (data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
      }
      if (data.gpa) {
        setGpa(data.gpa);
      }
    } catch (err) {
      // Keep existing list on transient failure
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects(searchQuery);
  }, [fetchSubjects, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects(searchQuery);
  };

  const handleDeleteSubject = (sub) => {
    const doDelete = async () => {
      try {
        await deleteSubjectApi(sub._id);
        fetchSubjects(searchQuery);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${sub.name} (${sub.code})?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Delete Subject', `Delete ${sub.name} (${sub.code})?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // Split subjects into "My Subjects" and "Main Hub" matching design
  const mySubjects = subjects.filter((s) => s.category !== 'main_hub');
  const mainHubSubjects = subjects.filter((s) => s.category === 'main_hub');

  return (
    <View style={styles.root}>
      {/* Top Header matching reference (media_1794714940209_282a55f9.png) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={onNavigateToProfile}
          activeOpacity={0.7}
        >
          <View style={styles.avatarCircle}>
            <Icon name="user" size={18} color="#2563EB" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Subjects</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditMode(!isEditMode)}
            activeOpacity={0.7}
          >
            <Text style={[styles.editBtnText, isEditMode && styles.editBtnActive]}>
              {isEditMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setEditingSubject(null);
              setModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Icon name="plus" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects, codes, instructors..."
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

      {/* Content List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#16A36A" />
          <Text style={styles.loadingText}>Loading enrolled subjects...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            isDesktop && styles.desktopContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#16A36A']}
            />
          }
        >
          {/* SECTION 1: MY SUBJECTS */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>MY SUBJECTS</Text>

            <View style={styles.cardGroup}>
              {mySubjects.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No subjects in this section.</Text>
                </View>
              ) : (
                mySubjects.map((sub, index) => {
                  const isLast = index === mySubjects.length - 1;
                  return (
                    <TouchableOpacity
                      key={sub._id}
                      style={[styles.subjectItem, isLast && styles.subjectItemLast]}
                      onPress={() => onSelectSubject && onSelectSubject(sub)}
                      activeOpacity={0.7}
                    >
                      {/* Left color dot */}
                      <View
                        style={[
                          styles.dotIndicator,
                          { backgroundColor: sub.color || '#F59E0B' },
                        ]}
                      />

                      {/* Middle metadata */}
                      <View style={styles.itemMeta}>
                        <Text style={styles.itemCode}>{sub.code}</Text>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        <Text style={styles.itemCredits}>
                          {sub.credits} credit{sub.credits === 1 ? '' : 's'}
                        </Text>
                      </View>

                      {/* Right Grade or Delete Action */}
                      <View style={styles.itemRight}>
                        {isEditMode ? (
                          <TouchableOpacity
                            style={styles.deleteCircle}
                            onPress={() => handleDeleteSubject(sub)}
                          >
                            <Icon name="trash-2" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        ) : (
                          <>
                            {sub.grade ? (
                              <Text style={styles.itemGrade}>{sub.grade}</Text>
                            ) : null}
                            <Icon name="chevron-right" size={18} color="#94A3B8" />
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {/* SECTION 2: MAIN HUB */}
          <View style={styles.sectionContainer}>
            <View style={styles.hubHeaderRow}>
              <View style={styles.hubTitleRow}>
                <Icon name="lock" size={15} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.sectionHeading}>MAIN HUB</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setEditingSubject(null);
                  setModalVisible(true);
                }}
              >
                <Icon name="more-horizontal" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardGroup}>
              {mainHubSubjects.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No subjects in Main Hub.</Text>
                </View>
              ) : (
                mainHubSubjects.map((sub, index) => {
                  const isLast = index === mainHubSubjects.length - 1;
                  return (
                    <TouchableOpacity
                      key={sub._id}
                      style={[styles.subjectItem, isLast && styles.subjectItemLast]}
                      onPress={() => onSelectSubject && onSelectSubject(sub)}
                      activeOpacity={0.7}
                    >
                      {/* Left icon with lock badge */}
                      <View
                        style={[
                          styles.lockCircle,
                          { backgroundColor: `${sub.color || '#EAB308'}20` },
                        ]}
                      >
                        <Icon
                          name="lock"
                          size={13}
                          color={sub.color || '#EAB308'}
                        />
                      </View>

                      {/* Middle metadata */}
                      <View style={styles.itemMeta}>
                        <Text style={styles.itemCode}>{sub.code}</Text>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        <Text style={styles.itemCredits}>
                          {sub.credits} credit{sub.credits === 1 ? '' : 's'}
                        </Text>
                      </View>

                      {/* Right chevron or delete */}
                      <View style={styles.itemRight}>
                        {isEditMode ? (
                          <TouchableOpacity
                            style={styles.deleteCircle}
                            onPress={() => handleDeleteSubject(sub)}
                          >
                            <Icon name="trash-2" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        ) : (
                          <Icon name="chevron-right" size={18} color="#94A3B8" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Sticky GPA Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.gpaText}>
          GPA: {String(gpa).replace('.', ',')}
        </Text>
      </View>

      {/* Add / Edit Subject Modal */}
      <AddSubjectModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingSubject(null);
        }}
        initialSubject={editingSubject}
        onSubjectSaved={() => {
          fetchSubjects(searchQuery);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileBtn: {
    padding: 2,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  editBtnText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  editBtnActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  addBtn: {
    padding: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  desktopContainer: {
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  hubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subjectItemLast: {
    borderBottomWidth: 0,
  },
  dotIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
  },
  lockCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemMeta: {
    flex: 1,
  },
  itemCode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemCredits: {
    fontSize: 12,
    color: '#94A3B8',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 10,
  },
  itemGrade: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 2,
  },
  deleteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
});
