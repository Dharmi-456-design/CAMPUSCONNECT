import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Navigates to main app dashboard (full auth wired in Day 1)
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Text style={{ fontSize: 28 }}>🎓</Text>
          </View>
          <Text style={styles.heading}>Welcome to Campus<Text style={{ color: '#16A36A' }}>One</Text></Text>
          <Text style={styles.subheading}>Sign in with your student credentials to continue</Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>College Email</Text>
            <TextInput
              style={styles.input}
              placeholder="student@university.edu"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to CampusOne? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  inner: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172B4D',
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#172B4D',
    backgroundColor: '#F8FAFC',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#16A36A',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#16A36A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  footerLink: {
    color: '#16A36A',
    fontSize: 14,
    fontWeight: '700',
  },
});
