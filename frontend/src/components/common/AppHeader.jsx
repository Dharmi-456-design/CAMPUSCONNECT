import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function AppHeader({ title, showBack, onBack, onNotificationPress, rightComponent }) {
  const { user } = useAuthStore();

  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.userSection}>
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarSquare}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || '🎓'}</Text>
              </View>
            )}
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.greeting}>{user?.name || 'Student'}</Text>
              <Text style={styles.collegeBadge}>{user?.branch || 'Campus'}</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightSection}>
        {rightComponent ? (
          rightComponent
        ) : onNotificationPress ? (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconBtn} activeOpacity={0.8}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAF7',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEAE5'
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    padding: 6,
    marginRight: 8
  },
  backIcon: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: 'bold'
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 10
  },
  avatarSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  },
  welcomeTextGroup: {
    justifyContent: 'center'
  },
  greeting: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  collegeBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBtn: {
    padding: 6
  },
  notifIcon: {
    fontSize: 20
  }
});
