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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // Navigates to main app dashboard (full registration wired in Day 1)
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
          <Text style={styles.heading}>Create Account 🚀</Text>
          <Text style={styles.subheading}>Join CampusOne to access your college super app</Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Michael Aguero"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Student ID / Roll No</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 17081010086"
              placeholderTextColor="#94A3B8"
              value={studentId}
              onChangeText={setStudentId}
            />
          </View>

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

          <TouchableOpacity style={styles.submitBtn} onPress={handleSignup} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Sign In</Text>
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
    marginBottom: 24,
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
    marginBottom: 16,
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
  submitBtn: {
    backgroundColor: '#16A36A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
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
    marginTop: 24,
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
