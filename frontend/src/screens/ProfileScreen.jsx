import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';
import ManageAccountModal from './profile/ManageAccountModal';
import ChangePasswordModal from './profile/ChangePasswordModal';
import ProfileSettingsModal from './profile/ProfileSettingsModal';

export default function ProfileScreen({ onNavigateTab }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, setAuth, updateUser, logout } = useAuthStore();

  const [manageAccountVisible, setManageAccountVisible] = useState(false);
  const [changePwdVisible, setChangePwdVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const initial = (user?.name || 'D').charAt(0).toUpperCase();
  const userName = user?.name || 'Dharmi Patel';
  const userEmail = user?.email || 'dharmi.patel@campus.edu';
  const userBranch = user?.branch || 'Computer Engineering';
  const userCollege = user?.college || 'Swaminarayan University, Kalol';
  const userSem = user?.semester || 3;
  const userRoll = user?.rollNumber || 'SSIT2023CE047';
  const userBio = user?.bio || 'B.Tech Computer Engineering student passionate about Full-Stack & AI.';

  const handleProfileUpdated = async (updatedUser) => {
    if (updatedUser) {
      await updateUser(updatedUser);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out of CampusOne?');
      if (confirmed) logout();
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out of CampusOne? You will need to log back in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: () => logout(),
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }]}>
      {/* Top Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderBottomColor: isDark ? '#334155' : '#F1F5F9',
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
          My Profile
        </Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
            ]}
            onPress={toggleTheme}
          >
            <Icon
              name={isDark ? 'sun' : 'moon'}
              size={18}
              color={isDark ? '#FBBF24' : '#16A36A'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
            ]}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Icon name="settings" size={18} color="#16A36A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* Profile Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: '#16A36A' }]}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.onlineBadge} />
            </View>

            {/* User Meta */}
            <View style={styles.heroUserMeta}>
              <View style={styles.nameRow}>
                <Text
                  style={[
                    styles.userName,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}
                >
                  {userName}
                </Text>
                <View style={styles.verifiedTag}>
                  <Icon name="check" size={10} color="#16A36A" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              <Text style={styles.userEmail}>{userEmail}</Text>

              <View style={styles.pillsRow}>
                <View style={styles.pillDept}>
                  <Text style={styles.pillDeptText}>{userBranch}</Text>
                </View>
                <View style={styles.pillSem}>
                  <Text style={styles.pillSemText}>Sem {userSem}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bio Snippet */}
          <View style={[styles.bioBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
            <Text style={[styles.bioText, { color: isDark ? '#94A3B8' : '#475569' }]}>
              {userBio}
            </Text>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setManageAccountVisible(true)}
              activeOpacity={0.85}
            >
              <Icon name="edit-2" size={15} color="#FFFFFF" />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.changePasswordBtn,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
              onPress={() => setChangePwdVisible(true)}
              activeOpacity={0.85}
            >
              <Icon name="lock" size={15} color="#16A36A" />
              <Text
                style={[
                  styles.changePasswordBtnText,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Academic Details Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="book-open" size={16} color="#16A36A" />
            <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Academic Credentials
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Institution</Text>
              <Text
                style={[
                  styles.infoVal,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                {userCollege}
              </Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Enrollment ID</Text>
              <Text style={[styles.infoVal, { color: '#16A36A', fontWeight: '800' }]}>
                {userRoll}
              </Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Academic Program</Text>
              <Text
                style={[
                  styles.infoVal,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                B.Tech in {userBranch}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings & Portals Quick Access */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="sliders" size={16} color="#16A36A" />
            <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Settings & Portals
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => setSettingsModalVisible(true)}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.navIconBox, { backgroundColor: 'rgba(22, 163, 106, 0.12)' }]}>
                <Icon name="settings" size={16} color="#16A36A" />
              </View>
              <Text style={[styles.navRowTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Account & Preferences
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => onNavigateTab && onNavigateTab('apk-download')}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.navIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Icon name="download" size={16} color="#16A36A" />
              </View>
              <View>
                <Text style={[styles.navRowTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Download Android APK
                </Text>
                <Text style={styles.navRowSub}>Version 1.0.0 APK</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => onNavigateTab && onNavigateTab('about')}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.navIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Icon name="info" size={16} color="#0284C7" />
              </View>
              <Text style={[styles.navRowTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                About CampusOne
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button with Confirmation */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Icon name="log-out" size={16} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Sign Out of CampusOne</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <ManageAccountModal
        visible={manageAccountVisible}
        currentUser={user}
        onClose={() => setManageAccountVisible(false)}
        onProfileUpdated={handleProfileUpdated}
        isDark={isDark}
        theme={theme}
      />

      <ChangePasswordModal
        visible={changePwdVisible}
        onClose={() => setChangePwdVisible(false)}
        isDark={isDark}
      />

      <ProfileSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onOpenManageAccount={() => setManageAccountVisible(true)}
        onOpenSecurity={() => setChangePwdVisible(true)}
        onOpenApkDownload={() => onNavigateTab && onNavigateTab('apk-download')}
        onOpenAbout={() => onNavigateTab && onNavigateTab('about')}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  onlineBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  heroUserMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  pillDept: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillDeptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  pillSem: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillSemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  bioBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editProfileBtn: {
    flex: 1,
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  changePasswordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  changePasswordBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  navRowSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
