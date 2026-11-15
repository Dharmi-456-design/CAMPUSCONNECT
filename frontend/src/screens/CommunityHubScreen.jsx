import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import CommunityFeedScreen from './community/CommunityFeedScreen';
import LostFoundScreen from './LostFoundScreen';

export default function CommunityHubScreen({ initialTab = 'community', onNavigateTab }) {
  const { theme, isDark } = useTheme();
  const [activeModule, setActiveModule] = useState(initialTab); // 'community' | 'lostfound'

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }]}>
      {/* Top Segmented Bar for Community Hub */}
      <View
        style={[
          styles.topSwitcherContainer,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderBottomColor: isDark ? '#334155' : '#E2E8F0',
          },
        ]}
      >
        <View style={[styles.switcherPillBox, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
          <TouchableOpacity
            style={[
              styles.switcherTab,
              activeModule === 'community' && [
                styles.switcherTabActive,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
              ],
            ]}
            onPress={() => setActiveModule('community')}
            activeOpacity={0.8}
          >
            <Icon
              name="message-square"
              size={14}
              color={activeModule === 'community' ? '#16A36A' : '#64748B'}
            />
            <Text
              style={[
                styles.switcherTabText,
                activeModule === 'community' && [
                  styles.switcherTabTextActive,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ],
              ]}
            >
              Forum & Doubts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switcherTab,
              activeModule === 'lostfound' && [
                styles.switcherTabActive,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
              ],
            ]}
            onPress={() => setActiveModule('lostfound')}
            activeOpacity={0.8}
          >
            <Icon
              name="search"
              size={14}
              color={activeModule === 'lostfound' ? '#16A36A' : '#64748B'}
            />
            <Text
              style={[
                styles.switcherTabText,
                activeModule === 'lostfound' && [
                  styles.switcherTabTextActive,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ],
              ]}
            >
              Lost & Found
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Active Module */}
      <View style={styles.moduleContent}>
        {activeModule === 'community' ? (
          <CommunityFeedScreen onNavigateTab={onNavigateTab} />
        ) : (
          <LostFoundScreen />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSwitcherContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  switcherPillBox: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 8,
  },
  switcherTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  switcherTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  switcherTabTextActive: {
    fontWeight: '700',
  },
  moduleContent: {
    flex: 1,
  },
});
