import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';

export default function SettingsScreen({ onNavigateTab, onBack }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }]}>
      {/* Header matching screenshot 1 */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Icon name="arrow-left" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* SECTION 1: ACCOUNT */}
        <Text style={[styles.sectionHeading, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          ACCOUNT
        </Text>
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => onNavigateTab && onNavigateTab('profile')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="user" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Profile
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => onNavigateTab && onNavigateTab('subscription')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="credit-card" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Subscription
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* SECTION 2: PRIVACY AND SECURITY */}
        <Text style={[styles.sectionHeading, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          PRIVACY AND SECURITY
        </Text>
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Privacy Policy',
                'CampusOne encrypts student credentials and enforces privacy controls on user contact info in Lost & Found reports.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="user-check" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Privacy policy
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Security Center',
                'Your session is protected with industry-standard bcrypt hashing and JWT tokens.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="shield" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Security & Verification
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* SECTION 3: PREFERENCES */}
        <Text style={[styles.sectionHeading, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          PREFERENCES
        </Text>
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          {/* Notifications */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Notification Preferences',
                'Push notifications for exams, hackathon squad requests, and event reminders are currently enabled.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="bell" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Notifications
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

          {/* Theme Toggle */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Icon name="moon" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Dark Theme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
              thumbColor={isDark ? '#16A36A' : '#F1F5F9'}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

          {/* Language */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Language Selection',
                'CampusOne is set to English (US). Hindi and Gujarati support coming in v1.1.0!'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="globe" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Language
              </Text>
            </View>
            <View style={styles.menuRowRight}>
              <Text style={styles.langText}>English</Text>
              <Icon name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION 4: ABOUT & APP VERSION */}
        <Text style={[styles.sectionHeading, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          APPLICATION INFO
        </Text>
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => onNavigateTab && onNavigateTab('about')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="info" size={18} color="#16A36A" />
              <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                About CampusOne
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => onNavigateTab && onNavigateTab('apk-download')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Icon name="download" size={18} color="#16A36A" />
              <View>
                <Text style={[styles.menuRowText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Download Android APK
                </Text>
                <Text style={styles.versionSub}>v1.0.0 (Release 2026.1)</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
    marginLeft: 6,
  },
  cardGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuRowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  versionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    marginLeft: 50,
  },
});
