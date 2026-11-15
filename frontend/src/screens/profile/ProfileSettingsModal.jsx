import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import Icon from '../../components/common/Icon';

export default function ProfileSettingsModal({
  visible,
  onClose,
  onOpenManageAccount,
  onOpenSecurity,
  onOpenApkDownload,
  onOpenAbout,
  isDark,
}) {
  const handleInviteFriend = async () => {
    try {
      await Share.share({
        message:
          'Join me on CampusOne — the all-in-one smart campus app for lecture notes, events, campus doubts & lost & found! Download here: https://github.com/Dharmi-456-design/CAMPUSCONNECT',
      });
    } catch {
      // ignore
    }
  };

  const handleSupport = () => {
    Alert.alert(
      'Campus Support',
      'For technical assistance, email support@campusconnect.edu or contact the SSIT IT Helpdesk in Room 102.'
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'CampusOne protects student data. Contact numbers and email addresses can be hidden in Lost & Found, and exam notes are strictly student-owned.'
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Use',
      'CampusOne is authorized for enrolled students, faculty, and administrators of Swaminarayan University.'
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          {/* Header matching screenshot 2 */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Profile
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="x" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Card Group 1: Manage Account & Notifications */}
            <View
              style={[
                styles.cardGroup,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  if (onOpenManageAccount) onOpenManageAccount();
                }}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.iconCircle}>
                    <Icon name="user" size={16} color="#16A36A" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Manage Account
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  if (onOpenSecurity) onOpenSecurity();
                }}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.iconCircle}>
                    <Icon name="lock" size={16} color="#16A36A" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Security & Password
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>
            </View>

            {/* Card Group 2: Privacy Policy & Terms of Use */}
            <View
              style={[
                styles.cardGroup,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
                <View style={styles.menuLeft}>
                  <View style={styles.iconCircle}>
                    <Icon name="shield" size={16} color="#16A36A" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Privacy Policy
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />

              <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
                <View style={styles.menuLeft}>
                  <View style={styles.iconCircle}>
                    <Icon name="file-text" size={16} color="#16A36A" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Terms of Use
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>
            </View>

            {/* Card Group 3: Support */}
            <View
              style={[
                styles.cardGroup,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
                <View style={styles.menuLeft}>
                  <View style={styles.iconCircle}>
                    <Icon name="message-circle" size={16} color="#16A36A" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Support & Helpdesk
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>
            </View>

            {/* Card Group 4: Invite a Friend */}
            <View
              style={[
                styles.cardGroup,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <TouchableOpacity style={styles.menuItem} onPress={handleInviteFriend}>
                <View style={styles.menuLeft}>
                  <View style={styles.iconCircle}>
                    <Icon name="volume-2" size={16} color="#16A36A" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Invite a Friend
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>
            </View>

            {/* Card Group 5: APK Download Section */}
            <View
              style={[
                styles.cardGroup,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  if (onOpenApkDownload) onOpenApkDownload();
                }}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <Icon name="download" size={16} color="#16A36A" />
                  </View>
                  <View>
                    <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                      Download Android APK
                    </Text>
                    <Text style={styles.menuSub}>Latest v1.0.0 build</Text>
                  </View>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  if (onOpenAbout) onOpenAbout();
                }}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.iconCircle}>
                    <Icon name="info" size={16} color="#16A36A" />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    About CampusOne
                  </Text>
                </View>
                <Icon name="arrow-right" size={16} color="#16A36A" />
              </TouchableOpacity>
            </View>

            {/* Follow Us Section matching screenshot 2 */}
            <View style={styles.followUsSection}>
              <Text style={[styles.followUsTitle, { color: isDark ? '#94A3B8' : '#0F172A' }]}>
                Follow Us
              </Text>
              <View style={styles.socialRow}>
                <View style={[styles.socialIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={{ fontSize: 18 }}>📸</Text>
                </View>
                <View style={[styles.socialIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={{ fontSize: 18 }}>▶️</Text>
                </View>
                <View style={[styles.socialIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={{ fontSize: 18 }}>📌</Text>
                </View>
                <View style={[styles.socialIcon, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={{ fontSize: 18 }}>🎵</Text>
                </View>
              </View>

              {/* Shortcuts pill matching Image 6 */}
              <View style={styles.shortcutsWrapper}>
                <View style={styles.shortcutsPill}>
                  <View style={styles.shortcutsIconBox}>
                    <Text style={{ fontSize: 14 }}>⚡</Text>
                  </View>
                  <Text style={styles.shortcutsText}>shortcuts</Text>
                </View>
              </View>
            </View>
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
    maxHeight: '92%',
    minHeight: '70%',
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  cardGroup: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22, 163, 106, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  followUsSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  followUsTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutsWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  shortcutsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  shortcutsIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
