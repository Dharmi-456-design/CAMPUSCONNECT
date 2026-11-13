import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

/**
 * Welcome Screen (Inspired by Image 2 - Educonnect/CampusOne Welcome Flow)
 * Displays brand logo, hero illustration, and dual action buttons (Login & Signup).
 */
export default function WelcomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Brand Header */}
      <View style={styles.brandBox}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🎓</Text>
        </View>
        <Text style={styles.brandTitle}>Campus<Text style={{ color: '#16A36A' }}>One</Text></Text>
        <Text style={styles.brandTagline}>Student Life Super App</Text>
      </View>

      {/* Hero Illustration Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>🧑‍🏫 💻 📚</Text>
        <Text style={styles.heroTitle}>Campus Made Simple</Text>
        <Text style={styles.heroSubtitle}>
          Join thousands of university students collaborating on lecture notes, doubt solving, and college events.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.signupBtnText}>Signup</Text>
        </TouchableOpacity>
      </View>

      {/* Guest Exploration */}
      <TouchableOpacity
        style={styles.guestLink}
        onPress={() => router.replace('/(tabs)/home')}
        activeOpacity={0.7}
      >
        <Text style={styles.guestText}>Explore as Guest ›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 28,
    paddingTop: 68,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBox: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172B4D',
    letterSpacing: -0.4,
  },
  brandTagline: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
    marginVertical: 20,
  },
  heroEmoji: {
    fontSize: 44,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  loginBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#172B4D',
    fontSize: 16,
    fontWeight: '700',
  },
  signupBtn: {
    backgroundColor: '#16A36A',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  guestLink: {
    paddingVertical: 8,
    marginTop: 6,
  },
  guestText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});

