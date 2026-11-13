import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  APK_DOWNLOAD_URL,
  GITHUB_REPOSITORY_URL,
  APP_VERSION,
} from '../../src/constants/api';

export default function ProfileScreen() {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadAPK = () => {
    if (!APK_DOWNLOAD_URL) {
      Alert.alert(
        'APK Not Configured Yet',
        'The release Android APK has not been published to Google Drive yet. Please run Day 7 EAS build and set EXPO_PUBLIC_APK_DOWNLOAD_URL.',
        [{ text: 'OK' }]
      );
      return;
    }
    Linking.openURL(APK_DOWNLOAD_URL).catch(() => {
      Alert.alert('Error', 'Unable to open download link in browser.');
    });
  };

  const handleOpenGitHub = () => {
    Linking.openURL(GITHUB_REPOSITORY_URL).catch(() => {
      Alert.alert('Error', 'Unable to open GitHub link.');
    });
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out from CampusOne?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MA</Text>
        </View>
        <Text style={styles.userName}>Michael Aguero</Text>
        <Text style={styles.userSub}>Roll No: 17081010086 · CS Semester 6</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Student Account</Text>
        </View>
      </View>

      {/* APK & Submission Section (MANDATORY per Master Prompt) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>College Submission & Deliverables</Text>
      </View>

      <View style={styles.actionCard}>
        <TouchableOpacity style={styles.downloadApkBtn} onPress={handleDownloadAPK} activeOpacity={0.85}>
          <Text style={styles.apkIcon}>📦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.apkTitle}>Download Android APK</Text>
            <Text style={styles.apkSub}>
              {APK_DOWNLOAD_URL ? 'Download latest build (.apk)' : 'Preview profile via Expo EAS Build'}
            </Text>
          </View>
          <Text style={styles.apkArrow}>📥</Text>
        </TouchableOpacity>

        <View style={styles.cardDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={handleOpenGitHub}>
          <Text style={styles.menuEmoji}>🐙</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>GitHub Repository</Text>
            <Text style={styles.menuSub}>Source code & documentation</Text>
          </View>
          <Text style={styles.menuArrow}>↗</Text>
        </TouchableOpacity>
      </View>

      {/* Settings & Info */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account & Preferences</Text>
      </View>

      <View style={styles.menuCard}>
        {[
          { emoji: '✏️', label: 'Edit Profile Information' },
          { emoji: '🔒', label: 'Update Password & Security' },
          { emoji: '🔔', label: 'Push Notifications' },
          { emoji: '📄', label: 'Privacy Policy & Terms' },
        ].map((item, index) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <Text style={styles.menuLabelSimple}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            {index < 3 && <View style={styles.cardDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* App Version Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersionText}>CampusOne — Student Life Super App</Text>
        <Text style={styles.appBuildText}>Version {APP_VERSION} (Build 2026.11) · White Theme Architecture</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B4D',
  },
  userSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  roleBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  roleText: {
    color: '#16A36A',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172B4D',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  downloadApkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  apkIcon: {
    fontSize: 26,
  },
  apkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A36A',
  },
  apkSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  apkArrow: {
    fontSize: 18,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172B4D',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuLabelSimple: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#172B4D',
  },
  menuArrow: {
    fontSize: 18,
    color: '#94A3B8',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 20,
  },
  appVersionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  appBuildText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
