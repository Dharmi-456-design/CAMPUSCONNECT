import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import SubjectListScreen from './academics/SubjectListScreen';
import SubjectDetailsScreen from './academics/SubjectDetailsScreen';
import Icon from '../components/common/Icon';

export default function AcademicsScreen({ onNavigateTab }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  // Active view: 'subjects' | 'subject-details' | 'khs'
  const [currentView, setCurrentView] = useState('subjects');
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject-details');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setCurrentView('subjects');
  };

  const handleCreateNoteForSubject = (subject) => {
    // Navigate to notes tab with subject preselected
    if (onNavigateTab) {
      onNavigateTab('notes', { subjectId: subject._id, subjectName: subject.name });
    }
  };

  if (currentView === 'subject-details' && selectedSubject) {
    return (
      <SubjectDetailsScreen
        subjectId={selectedSubject._id}
        onBack={handleBackToSubjects}
        onNavigateToNote={(note) => {
          if (onNavigateTab) onNavigateTab('notes', { noteId: note._id });
        }}
        onCreateNoteForSubject={handleCreateNoteForSubject}
        onSubjectDeleted={handleBackToSubjects}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Top segment switcher for Subjects vs Kartu Hasil Studi */}
      <View style={styles.topSegmentBar}>
        <TouchableOpacity
          style={[styles.segmentBtn, currentView === 'subjects' && styles.segmentBtnActive]}
          onPress={() => setCurrentView('subjects')}
          activeOpacity={0.8}
        >
          <Icon
            name="book"
            size={15}
            color={currentView === 'subjects' ? '#FFFFFF' : '#64748B'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              currentView === 'subjects' && styles.segmentTextActive,
            ]}
          >
            My Subjects & Hub
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, currentView === 'khs' && styles.segmentBtnActive]}
          onPress={() => setCurrentView('khs')}
          activeOpacity={0.8}
        >
          <Icon
            name="award"
            size={15}
            color={currentView === 'khs' ? '#FFFFFF' : '#64748B'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              currentView === 'khs' && styles.segmentTextActive,
            ]}
          >
            Grade Card (SGPA / Result)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main View Render */}
      {currentView === 'subjects' ? (
        <SubjectListScreen
          onSelectSubject={handleSelectSubject}
          onNavigateToProfile={() => onNavigateTab && onNavigateTab('profile')}
        />
      ) : (
        <ScrollView
          style={styles.khsScroll}
          contentContainerStyle={[styles.khsContent, isDesktop && styles.desktopContainer]}
          showsVerticalScrollIndicator={false}
        >
          {/* Swaminarayan University SGPA Result Summary */}
          <View style={styles.khsHeroCard}>
            <View style={styles.khsHeroHeader}>
              <View>
                <Text style={styles.khsTitle}>Semester 6 Academic Result</Text>
                <Text style={styles.khsSub}>Swaminarayan University, Kalol • SSIT</Text>
              </View>
              <View style={styles.khsGpaBadge}>
                <Text style={styles.khsGpaLabel}>SGPA</Text>
                <Text style={styles.khsGpaValue}>8.92</Text>
              </View>
            </View>

            <View style={styles.khsStatsRow}>
              <View style={styles.khsStatItem}>
                <Text style={styles.khsStatNum}>24</Text>
                <Text style={styles.khsStatLbl}>Total Credits</Text>
              </View>
              <View style={styles.khsStatDivider} />
              <View style={styles.khsStatItem}>
                <Text style={styles.khsStatNum}>6</Text>
                <Text style={styles.khsStatLbl}>Subjects</Text>
              </View>
              <View style={styles.khsStatDivider} />
              <View style={styles.khsStatItem}>
                <Text style={styles.khsStatNum}>First Class</Text>
                <Text style={styles.khsStatLbl}>Distinction</Text>
              </View>
            </View>
          </View>

          {/* Quick switch back banner */}
          <TouchableOpacity
            style={styles.manageSubjectsBanner}
            onPress={() => setCurrentView('subjects')}
            activeOpacity={0.8}
          >
            <View style={styles.manageBannerLeft}>
              <Icon name="edit-3" size={18} color="#16A36A" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.manageBannerTitle}>Manage Enrolled Subjects</Text>
                <Text style={styles.manageBannerSub}>Add, edit, or customize your course modules & grades</Text>
              </View>
            </View>
            <Icon name="arrow-right" size={18} color="#16A36A" />
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topSegmentBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  segmentBtnActive: {
    backgroundColor: '#16A36A',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  khsScroll: {
    flex: 1,
  },
  khsContent: {
    padding: 16,
    paddingBottom: 40,
  },
  desktopContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  khsHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  khsHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  khsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  khsSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  khsGpaBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  khsGpaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A36A',
  },
  khsGpaValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16A36A',
  },
  khsStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  khsStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  khsStatNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  khsStatLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  khsStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  manageSubjectsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5EE',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  manageBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  manageBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A36A',
  },
  manageBannerSub: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 2,
  },
});
