import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';

const GITHUB_REPO_URL = 'https://github.com/Dharmi-456-design/CAMPUSCONNECT';

export default function AboutScreen({ onNavigateTab, onBack }) {
  const { theme, isDark } = useTheme();

  const handleOpenGitHub = () => {
    Linking.openURL(GITHUB_REPO_URL).catch(() => {});
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderBottomColor: isDark ? '#334155' : '#F1F5F9',
          },
        ]}
      >
        <View style={styles.headerRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Icon name="arrow-left" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            About CampusOne
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* App Hero Badge */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.appIconCircle}>
            <Text style={{ fontSize: 32 }}>🎓</Text>
          </View>
          <Text style={[styles.appName, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            CampusOne
          </Text>
          <Text style={styles.appTagline}>Smart Campus & Student Operations Hub</Text>

          <View style={styles.versionBadge}>
            <Icon name="tag" size={12} color="#16A36A" />
            <Text style={styles.versionBadgeText}>Version 1.0.0 (Release 2026.1)</Text>
          </View>
        </View>

        {/* Project & Developer Overview */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Project Information
          </Text>
          <Text style={[styles.description, { color: isDark ? '#94A3B8' : '#475569' }]}>
            CampusOne is a unified digital ecosystem designed for students, faculty, and administrators. It connects academics, lecture notes, campus events, community doubt solving, and lost & found management into a single intuitive interface.
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lead Developer</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Dharmi Patel
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Institution</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Shree Swaminarayan Institute of Technology (SSIT)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Affiliation</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Swaminarayan University, Kalol
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Technology</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              React Native, Expo, Express, MongoDB
            </Text>
          </View>
        </View>

        {/* Quick Links */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Quick Links & Downloads
          </Text>

          {/* GitHub Link */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={handleOpenGitHub}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#F1F5F9' }]}>
                <Icon name="github" size={18} color="#0F172A" />
              </View>
              <View>
                <Text style={[styles.linkTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  GitHub Repository
                </Text>
                <Text style={styles.linkSub}>Dharmi-456-design/CAMPUSCONNECT</Text>
              </View>
            </View>
            <Icon name="external-link" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* APK Download Link */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => onNavigateTab && onNavigateTab('apk-download')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#DCFCE7' }]}>
                <Icon name="download" size={18} color="#16A36A" />
              </View>
              <View>
                <Text style={[styles.linkTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Android APK Download
                </Text>
                <Text style={styles.linkSub}>Install latest Android build</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 CampusOne • All rights reserved
          </Text>
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
  },
  headerRow: {
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
    fontSize: 22,
    fontWeight: '800',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  appIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 14,
    textAlign: 'center',
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  versionBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoRow: {
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
