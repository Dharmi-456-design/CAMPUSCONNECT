import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { loginApi, registerApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';

// CampusOne Graduation Cap Logo Icon (matches Screenshot 3 Educonnect style)
function CampusOneLogo({ size = 56 }) {
  return (
    <View style={styles.logoContainer}>
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Glow / Star Accents */}
        <Path d="M22 14L23.2 17.8L27 19L23.2 20.2L22 24L20.8 20.2L17 19L20.8 17.8L22 14Z" fill="#16A36A" />
        <Path d="M38 10L39 12.8L42 13.8L39 14.8L38 17.6L37 14.8L34 13.8L37 12.8L38 10Z" fill="#16A36A" />
        <Path d="M48 16L48.8 18.2L51 19L48.8 19.8L48 22L47.2 19.8L45 19L47.2 18.2L48 16Z" fill="#16A36A" />

        {/* Graduation Cap Top */}
        <Path
          d="M32 20L12 28L32 36L52 28L32 20Z"
          fill="#16A36A"
        />
        {/* Cap Bottom Skullcap */}
        <Path
          d="M20 31.5V38.5C20 44 25.5 47 32 47C38.5 47 44 44 44 38.5V31.5L32 36.5L20 31.5Z"
          fill="#128253"
        />
        {/* Tassel */}
        <Path
          d="M50 29V42C50 43.1 49.1 44 48 44C46.9 44 46 43.1 46 42V30.5"
          stroke="#16A36A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Circle cx="48" cy="45" r="2.5" fill="#16A36A" />
      </Svg>
      <Text style={styles.brandTitle}>
        Campus<Text style={{ color: '#16A36A' }}>One</Text>
      </Text>
      <Text style={styles.brandTagline}>STUDENT LIFE SUPER APP</Text>
    </View>
  );
}

// Student Collaboration Illustration for Welcome screen (matches Screenshot 3)
function CollaborationIllustration() {
  return (
    <View style={styles.illustrationWrapper}>
      <Svg width={240} height={170} viewBox="0 0 240 170" fill="none">
        {/* Whiteboard / Flip chart */}
        <Rect x="140" y="30" width="80" height="90" rx="6" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />
        <Rect x="150" y="42" width="60" height="6" rx="3" fill="#16A36A" />
        <Rect x="150" y="56" width="40" height="4" rx="2" fill="#94A3B8" />
        <Rect x="150" y="66" width="48" height="4" rx="2" fill="#94A3B8" />
        <Rect x="150" y="76" width="32" height="4" rx="2" fill="#94A3B8" />
        {/* Whiteboard stand legs */}
        <Path d="M155 120L145 155M205 120L215 155" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Clock on wall */}
        <Circle cx="120" cy="24" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
        <Path d="M120 18V24H124" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />

        {/* Student 1 (standing, presenting) */}
        <Circle cx="130" cy="70" r="10" fill="#FBBF24" />
        <Path d="M122 84C122 81 125 79 130 79C135 79 138 81 138 84V115H122V84Z" fill="#16A36A" />
        {/* Arm pointing */}
        <Path d="M136 86L152 75" stroke="#16A36A" strokeWidth="3" strokeLinecap="round" />
        <Path d="M125 115L124 150M135 115L136 150" stroke="#172B4D" strokeWidth="3" strokeLinecap="round" />

        {/* Student 2 (seated with laptop) */}
        <Circle cx="70" cy="74" r="9" fill="#F472B6" />
        <Path d="M63 86C63 83 66 82 70 82C74 82 77 83 77 86V112H63V86Z" fill="#6366F1" />
        {/* Chair */}
        <Path d="M60 98H80V125H60Z" fill="#E2E8F0" />
        <Path d="M62 125V150M78 125V150" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
        {/* Laptop on lap */}
        <Path d="M68 96L78 92" stroke="#172B4D" strokeWidth="3" strokeLinecap="round" />

        {/* Student 3 (seated left) */}
        <Circle cx="40" cy="80" r="8" fill="#FBBF24" />
        <Path d="M34 90C34 88 36 87 40 87C44 87 46 88 46 90V116H34V90Z" fill="#F59E0B" />
        <Path d="M34 116V150M44 116V150" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />

        {/* Plant on floor */}
        <Circle cx="20" cy="142" r="6" fill="#16A36A" />
        <Path d="M18 140Q20 128 22 140" stroke="#128253" strokeWidth="2" />
        <Rect x="16" y="142" width="8" height="10" rx="2" fill="#D97706" />
      </Svg>
    </View>
  );
}

export default function SplitAuthScreen({ initialMode = 'welcome' }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : initialMode === 'login' ? 'login' : 'welcome');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in both Email and Password.');
      } else {
        Alert.alert('Required Fields', 'Please enter both Email and Password.');
      }
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi({ email: email.trim(), password });
      if (res.success && res.data?.token) {
        setAuth(res.data.user, res.data.token);
      } else if (res.token) {
        setAuth(res.user, res.token);
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Login Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async () => {
    if (!name || !email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in Name, Email and Password.');
      } else {
        Alert.alert('Required Fields', 'Please complete all required fields.');
      }
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        rollNumber: username.trim() || '17081010086',
        branch: 'Computer Science & Engineering',
        semester: 6,
      };

      const res = await registerApi(payload);
      if (res.success && res.data?.token) {
        setAuth(res.data.user, res.data.token);
      } else if (res.token) {
        setAuth(res.user, res.token);
      } else {
        throw new Error(res.message || 'Signup failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to create account';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Registration Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for instant testing
  const handleQuickDemo = () => {
    const demoUser = {
      _id: 'demo-student-id-101',
      name: 'Michael Aguero',
      email: 'michael.aguero@campus.edu',
      rollNumber: '17081010086',
      branch: 'Computer Science & Engineering',
      semester: 6,
      gpa: 3.67,
      sks: 89,
      role: 'student',
    };
    setAuth(demoUser, 'demo_jwt_token_campusone_2026');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopContainer]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isDesktop && styles.desktopCard]}>
          {/* =================================================== */}
          {/* SCREEN 1: WELCOME SCREEN (Screenshot 3 Left)        */}
          {/* =================================================== */}
          {mode === 'welcome' && (
            <View style={styles.contentColumn}>
              <CampusOneLogo size={68} />
              <CollaborationIllustration />

              <Text style={styles.welcomeHeading}>Welcome</Text>
              <Text style={styles.welcomeSubtitle}>
                Collaborate with classmates, manage schedules, track academic records & access verified lecture notes.
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={styles.whiteBtn}
                  onPress={() => setMode('login')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.whiteBtnText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.greenBtn}
                  onPress={() => setMode('signup')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.greenBtnText}>Signup</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoLinkBtn}
                  onPress={handleQuickDemo}
                  activeOpacity={0.7}
                >
                  <Text style={styles.demoLinkText}>⚡ Quick Demo Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* =================================================== */}
          {/* SCREEN 2: LOGIN SCREEN (Screenshot 3 Middle)         */}
          {/* =================================================== */}
          {mode === 'login' && (
            <View style={styles.contentColumn}>
              {/* Back Arrow */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setMode('welcome')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="arrow-left" size={20} color="#172B4D" />
              </TouchableOpacity>

              <CampusOneLogo size={64} />

              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="student@campus.edu"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPassBtn}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.alert('Password reset instructions will be sent to your registered college email.');
                    } else {
                      Alert.alert('Reset Password', 'Password reset instructions sent to your college email.');
                    }
                  }}
                >
                  <Text style={styles.forgotPassText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Green Login Button */}
                <TouchableOpacity
                  style={styles.greenBtn}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.greenBtnText}>Login</Text>
                  )}
                </TouchableOpacity>

                {/* Demo Login */}
                <TouchableOpacity
                  style={styles.demoLinkBtn}
                  onPress={handleQuickDemo}
                  activeOpacity={0.7}
                >
                  <Text style={styles.demoLinkText}>⚡ Quick Demo Sign In</Text>
                </TouchableOpacity>

                {/* Switch to Signup */}
                <View style={styles.switchModeRow}>
                  <Text style={styles.switchModeText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => setMode('signup')}>
                    <Text style={styles.switchModeLink}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* =================================================== */}
          {/* SCREEN 3: SIGNUP SCREEN (Screenshot 3 Right)        */}
          {/* =================================================== */}
          {mode === 'signup' && (
            <View style={styles.contentColumn}>
              {/* Back Arrow */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setMode('welcome')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="arrow-left" size={20} color="#172B4D" />
              </TouchableOpacity>

              <CampusOneLogo size={64} />

              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Michael Aguero"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Username / Roll Number */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Username / Roll No</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="17081010086"
                    placeholderTextColor="#94A3B8"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="student@campus.edu"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Green Signup Button */}
                <TouchableOpacity
                  style={styles.greenBtn}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.greenBtnText}>Signup</Text>
                  )}
                </TouchableOpacity>

                {/* Demo Login */}
                <TouchableOpacity
                  style={styles.demoLinkBtn}
                  onPress={handleQuickDemo}
                  activeOpacity={0.7}
                >
                  <Text style={styles.demoLinkText}>⚡ Quick Demo Sign In</Text>
                </TouchableOpacity>

                {/* Switch to Login */}
                <View style={styles.switchModeRow}>
                  <Text style={styles.switchModeText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => setMode('login')}>
                    <Text style={styles.switchModeLink}>Log in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: '100%',
  },
  desktopContainer: {
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    position: 'relative',
  },
  desktopCard: {
    paddingHorizontal: 36,
    paddingVertical: 40,
  },
  contentColumn: {
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172B4D',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  illustrationWrapper: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#172B4D',
    marginTop: 8,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  buttonStack: {
    width: '100%',
    gap: 12,
  },
  whiteBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteBtnText: {
    color: '#172B4D',
    fontSize: 15,
    fontWeight: '700',
  },
  greenBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#16A36A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  greenBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoLinkBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  demoLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A36A',
  },
  formContainer: {
    width: '100%',
    marginTop: 8,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#172B4D',
    backgroundColor: '#FAFAFA',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#172B4D',
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotPassText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  switchModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  switchModeText: {
    fontSize: 13,
    color: '#64748B',
  },
  switchModeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A36A',
  },
});
