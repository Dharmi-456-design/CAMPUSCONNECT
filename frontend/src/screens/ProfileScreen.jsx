import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';
import { updateProfileApi } from '../api/auth.api';

const SETTINGS_GROUPS = [
  {
    title: 'Academic Info',
    icon: 'book-open',
    color: '#c9a84c',
    items: [
      { label: 'University / Institute', value: 'Shree Swaminarayan Institute of Technology (SSIT), Kalol', icon: 'home' },
      { label: 'Program / Branch', value: 'B.Tech Computer Engineering', icon: 'code' },
      { label: 'Semester', value: 'Semester 3 · 2023–24 Batch', icon: 'calendar' },
      { label: 'Enrollment ID', value: 'SSIT2023CE047', icon: 'hash' },
    ],
  },
  {
    title: 'Hostel & Campus Life',
    icon: 'home',
    color: '#22D3EE',
    items: [
      { label: 'Hostel Block', value: 'Boys Hostel · Block B, Room 215', icon: 'map-pin' },
      { label: 'Campus Card No.', value: 'CC-KALOL-2023-8821', icon: 'credit-card' },
      { label: 'Library Pass', value: 'Active · Valid till Jun 2026', icon: 'book' },
    ],
  },
  {
    title: 'Account & Security',
    icon: 'shield',
    icon: 'help-circle',
    color: '#F59E0B',
    items: [
      { label: 'About CampusOne', value: 'v2.1.0 · Swaminarayan University', icon: 'info' },
      { label: 'Report a Problem', value: 'Write to SSIT IT Team', icon: 'alert-triangle', isAction: true },
      { label: 'Privacy Policy', value: 'campus.ssit.edu/privacy', icon: 'file-text', isAction: true },
    ],
  },
];

const ACHIEVEMENTS = [
  { label: '7 Days Streak', icon: 'zap', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { label: 'Task Master', icon: 'award', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  { label: 'Note Creator', icon: 'book-open', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { label: 'Top Doubter', icon: 'help-circle', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
];

function ProfileHero({ user, isDark, theme, toggleTheme }) {
  const initial = (user?.name || 'D').charAt(0).toUpperCase();
  const userName = user?.name || 'Dharmi Patel';
  const userEmail = user?.email || 'dharmi.patel@ssit.edu.in';
  const userBranch = user?.branch || 'Computer Engineering';
  const userSem = user?.semester || 3;

  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: isDark ? '#101726' : '#FFFFFF',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#E2E8F0',
        },
      ]}
    >
      {/* Background Decoration */}
      <View style={styles.heroGradBg} />

      {/* Top Row: Avatar + Info */}
      <View style={styles.heroTop}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          </View>
          <View style={styles.onlineDot} />
        </View>

        {/* Name Info */}
        <View style={styles.heroNameCol}>
          <Text style={[styles.heroName, { color: theme.textPrimary }]}>{userName}</Text>
          <Text style={[styles.heroEmail, { color: theme.textMuted }]}>{userEmail}</Text>
          <View style={styles.heroTagsRow}>
            <View style={[styles.heroTag, { backgroundColor: isDark ? 'rgba(201, 168, 76, 0.15)' : '#fdf8e8' }]}>
              <Icon name="award" size={11} color="#c9a84c" style={{ marginRight: 4 }} />
              <Text style={{ color: isDark ? '#f0d074' : '#b8943e', fontSize: 11, fontWeight: '700' }}>Verified Scholar</Text>
            </View>
            <View style={[styles.heroTag, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Icon name="zap" size={11} color="#FBBF24" style={{ marginRight: 4 }} />
              <Text style={{ color: '#FBBF24', fontSize: 11, fontWeight: '700' }}>340 Credits</Text>
            </View>
            <View style={[styles.heroTag, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Text style={{ color: '#22D3EE', fontSize: 11, fontWeight: '700' }}>Sem {userSem}</Text>
            </View>
          </View>
        </View>

        {/* Theme Toggle */}
        <TouchableOpacity style={[styles.themeToggleBtn, { backgroundColor: isDark ? '#141D2D' : '#F1F5F9', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} onPress={toggleTheme} activeOpacity={0.8}>
          <Icon name={isDark ? 'sun' : 'moon'} size={16} color={isDark ? '#FBBF24' : '#c9a84c'} />
          <Text style={[styles.themeToggleText, { color: theme.textPrimary }]}>{isDark ? 'Light' : 'Dark'}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={[styles.statsBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: isDark ? '#f0d074' : '#b8943e' }]}>14</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Notes</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#22D3EE' }]}>8</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Doubts Solved</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#34D399' }]}>3</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Active Teams</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#FBBF24' }]}>7🔥</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Day Streak</Text>
        </View>
      </View>

      {/* Achievements Row */}
      <View style={styles.achievementsRow}>
        {ACHIEVEMENTS.map((a, i) => (
          <View key={i} style={[styles.achieveBadge, { backgroundColor: a.bg }]}>
            <Icon name={a.icon} size={13} color={a.color} style={{ marginRight: 5 }} />
            <Text style={{ color: a.color, fontSize: 11, fontWeight: '700' }}>{a.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, setAuth, logout } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || 'Swaminarayan University, Kalol');
  const [branch, setBranch] = useState(user?.branch || 'Computer Engineering');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await updateProfileApi({ name, college, branch, bio });
      if (res.success) {
        await setAuth(res.data.user, useAuthStore.getState().token);
        setEditMode(false);
        if (Platform.OS === 'web') window.alert('Profile updated successfully! 🎉');
        else Alert.alert('Success 🎉', 'Profile updated!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not save profile.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Sign out of CampusOne?');
      if (confirmed) await logout();
    } else {
      Alert.alert('Sign Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => await logout() },
      ]);
    }
  };

  const bgCard = theme.bgCard;
  const borderCard = theme.border;
  const textTitle = theme.textPrimary;
  const textSub = theme.textMuted;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
    >
      {/* ======================================================== */}
      {/* 1. PROFILE HERO BANNER                                   */}
      {/* ======================================================== */}
      <ProfileHero user={user} isDark={isDark} theme={theme} toggleTheme={toggleTheme} />

      {/* ======================================================== */}
      {/* 2. TWO-COLUMN GRID: Edit Profile + Settings               */}
      {/* ======================================================== */}
      <View style={styles.twoColGrid}>
        {/* LEFT: Edit Profile Form */}
        <View style={styles.formCol}>
          <View style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Icon name="user" size={15} color="#c9a84c" style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: textTitle }]}>Edit Academic Profile</Text>
              </View>
              <TouchableOpacity
                style={[styles.editToggleBtn, { backgroundColor: editMode ? '#c9a84c' : isDark ? '#141D2D' : '#F1F5F9', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}
                onPress={() => setEditMode(!editMode)}
              >
                <Icon name={editMode ? 'x' : 'edit-2'} size={13} color={editMode ? '#0c0f10' : textSub} />
                <Text style={{ color: editMode ? '#0c0f10' : textSub, fontSize: 11.5, fontWeight: '600', marginLeft: 4 }}>
                  {editMode ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldsGrid}>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>Full Name</Text>
                {editMode ? (
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: textTitle }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your full name"
                    placeholderTextColor={textSub}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: textTitle }]}>{name || user?.name || 'Dharmi Patel'}</Text>
                )}
              </View>

              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>University / Institute</Text>
                {editMode ? (
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: textTitle }]}
                    value={college}
                    onChangeText={setCollege}
                    placeholder="University name"
                    placeholderTextColor={textSub}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: textTitle }]}>{college}</Text>
                )}
              </View>

              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>Branch / Department</Text>
                {editMode ? (
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: textTitle }]}
                    value={branch}
                    onChangeText={setBranch}
                    placeholder="Your branch"
                    placeholderTextColor={textSub}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: textTitle }]}>{branch}</Text>
                )}
              </View>

              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>Current Term & Semester</Text>
                <Text style={[styles.fieldValue, { color: textTitle }]}>Semester 3 (2026-27)</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>Official Enrollment ID</Text>
                <Text style={[styles.fieldValue, { color: isDark ? '#f0d074' : '#b8943e', fontWeight: '800' }]}>SUK250054CE081</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>Bio & Skills</Text>
                {editMode ? (
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: textTitle, height: 60, textAlignVertical: 'top' }]}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    placeholder="e.g. 3rd Sem CSE student passionate about React Native & AI..."
                    placeholderTextColor={textSub}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: textTitle }]}>
                    {bio || 'B.Tech Computer Engineering student at SSIT, Kalol. Passionate about Full-Stack Development & Hackathons. 🚀'}
                  </Text>
                )}
              </View>
            </View>

            {editMode && (
              <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Icon name="check" size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveBtnText}>Save Profile Updates</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Sign Out Card */}
          <View style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
            <View style={styles.sectionTitleRow}>
              <Icon name="log-out" size={15} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Account Session</Text>
            </View>
            <Text style={[styles.settingsSub, { color: textSub }]}>
              Sign out of your account on this device. Your data will remain saved.
            </Text>
            <TouchableOpacity style={[styles.dangerBtn, { marginTop: 12 }]} onPress={handleLogout}>
              <Icon name="log-out" size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.dangerBtnText}>Sign Out of CampusOne</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RIGHT: Settings Panels */}
        <View style={styles.settingsCol}>
          {SETTINGS_GROUPS.map((group, gi) => (
            <View key={gi} style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
              <View style={[styles.sectionHeaderRow, { marginBottom: 14 }]}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.settingsGroupIcon, { backgroundColor: `${group.color}22` }]}>
                    <Icon name={group.icon} size={14} color={group.color} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: textTitle }]}>{group.title}</Text>
                </View>
              </View>

              <View style={styles.settingsList}>
                {group.items.map((item, ii) => (
                  <TouchableOpacity
                    key={ii}
                    style={[
                      styles.settingsItem,
                      ii < group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderCard },
                      item.isAction && { cursor: 'pointer' },
                    ]}
                    onPress={item.isToggle && item.label === 'Appearance' ? toggleTheme : undefined}
                    activeOpacity={item.isAction || item.isToggle ? 0.7 : 1}
                  >
                    <View style={styles.settingsItemLeft}>
                      <View style={[styles.settingsItemIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                        <Icon name={item.icon} size={13} color={isDark ? '#94A3B8' : '#64748B'} />
                      </View>
                      <View>
                        <Text style={[styles.settingsLabel, { color: textTitle }]}>{item.label}</Text>
                        <Text style={[styles.settingsValue, { color: textSub }]}>
                          {item.label === 'Appearance'
                            ? isDark ? 'Dark Mode Active' : 'Light Mode Active'
                            : item.value}
                        </Text>
                      </View>
                    </View>
                    {(item.isAction || item.isToggle) && (
                      <Icon name="chevron-right" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollInner: { padding: 22, paddingBottom: 40 },

  /* Hero */
  heroCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 22,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGradBg: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  avatarWrap: { position: 'relative' },
  avatarOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    borderWidth: 2.5,
    borderColor: '#c9a84c',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 20px rgba(201,168,76,0.45)' },
      default: {
        shadowColor: '#c9a84c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  avatarInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#c9a84c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#0c0f10', fontSize: 26, fontWeight: '800' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#080C14',
  },
  heroNameCol: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  heroEmail: { fontSize: 12.5, marginTop: 2, marginBottom: 8 },
  heroTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  themeToggleText: { fontSize: 11.5, fontWeight: '700' },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10.5, marginTop: 2 },
  statDivider: { width: 1, height: 26 },

  achievementsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  /* Two Column Layout */
  twoColGrid: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  formCol: { flex: 1.2, gap: 16 },
  settingsCol: { flex: 1, gap: 16 },

  /* Section Cards */
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 14.5, fontWeight: '800' },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  /* Form Fields */
  fieldsGrid: { gap: 14 },
  fieldRow: {},
  fieldLabel: { fontSize: 11.5, fontWeight: '600', marginBottom: 5 },
  fieldValue: { fontSize: 13.5, fontWeight: '500', lineHeight: 19 },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },

  saveBtn: {
    backgroundColor: '#c9a84c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 16,
    ...Platform.select({
      web: { boxShadow: '0px 3px 12px rgba(201,168,76,0.4)' },
      default: {
        shadowColor: '#c9a84c',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  saveBtnText: { color: '#0c0f10', fontSize: 13.5, fontWeight: '700' },

  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },

  dangerBtn: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  dangerBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  settingsSub: { fontSize: 12, lineHeight: 17, marginTop: 4 },

  /* Settings Groups */
  settingsGroupIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  settingsList: { gap: 0 },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  settingsItemIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: { fontSize: 13, fontWeight: '600' },
  settingsValue: { fontSize: 11, marginTop: 1 },
});
