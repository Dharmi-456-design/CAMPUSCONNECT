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
  Alert,
} from 'react-native';
import { router } from 'expo-router';

/**
 * Signup Screen (Inspired by Image 2 - Educonnect/CampusOne Signup Flow)
 * Fields: Name, Username, Email, Password, rounded emerald green `#16A36A` Signup button.
 */
export default function SignupScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in all the required fields to create your account.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Account Created! 🎉',
        'Welcome to CampusOne. You are now logged in as a student.',
        [{ text: 'Continue to App', onPress: () => router.replace('/(tabs)/home') }]
      );
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Top Back Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Brand Header */}
        <View style={styles.brandBox}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.brandTitle}>Campus<Text style={{ color: '#16A36A' }}>One</Text></Text>
          <Text style={styles.brandSubtitle}>Create your student life super app account</Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Michael Aguero"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username / Roll No</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 17081010086"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. michael@university.edu"
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

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSignup}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Creating Account...' : 'Signup'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Link to Login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Login</Text>
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  topNav: {
    marginBottom: 8,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#172B4D',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 20,
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
    elevation: 5,
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172B4D',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 22,
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
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#172B4D',
  },
  submitBtn: {
    backgroundColor: '#16A36A',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
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
    marginTop: 20,
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
