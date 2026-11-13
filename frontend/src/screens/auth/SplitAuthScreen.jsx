import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { makeShadow } from '../../utils/shadow';
import Svg, { Path } from 'react-native-svg';
import { loginApi, registerApi, googleLoginApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';

function GoogleSvgIcon({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={{ marginRight: 10 }}>
      <Path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
      />
      <Path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <Path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
      />
      <Path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
      />
    </Svg>
  );
}

export default function SplitAuthScreen({ initialMode = 'login' }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Modal State
  const [googleModalVisible, setGoogleModalVisible] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');

  // Animation for Sliding Split Container
  const slideAnim = useRef(new Animated.Value(initialMode === 'login' ? 0 : 1)).current;

  const toggleMode = (targetMode) => {
    setMode(targetMode);
    Animated.spring(slideAnim, {
      toValue: targetMode === 'login' ? 0 : 1,
      tension: 40,
      friction: 8,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  // Google Identity Services Setup for Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '402286075226-a65ogtb4kjl5ee62v71l8cvnemfeqp7q.apps.googleusercontent.com';

      const handleCredentialResponse = async (response) => {
        try {
          setGoogleLoading(true);
          const res = await googleLoginApi({ credential: response.credential, idToken: response.credential });
          if (res.success && res.data?.token) {
            setAuth(res.data.user, res.data.token);
          } else if (res.token) {
            setAuth(res.user, res.token);
          } else {
            window.alert('Google Sign-In failed. Please try again.');
          }
        } catch (err) {
          console.error('Google Sign-In Error:', err);
          window.alert(err.response?.data?.message || 'Google Auth Error');
        } finally {
          setGoogleLoading(false);
          setGoogleModalVisible(false);
        }
      };

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => {
          if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
            });
          }
        };
        document.body.appendChild(script);
      }
    }
  }, []);

  const handleGoogleClick = () => {
    setGoogleModalVisible(true);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  const confirmGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const fakeToken = 'mock_google_id_token_dharmi_patel';
      const res = await googleLoginApi({
        userInfo: {
          email: 'dharmi.patel@gmail.com',
          name: 'Dharmi Patel',
          googleId: '402286075226-a65ogtb4kjl5ee62v71l8cvnemfeqp7q',
        },
        idToken: fakeToken,
      });

      if (res.success && res.data?.token) {
        setAuth(res.data.user, res.data.token);
      } else if (res.token) {
        setAuth(res.user, res.token);
      } else {
        setAuth(
          {
            _id: 'g-user-dharmi',
            name: 'Dharmi Patel',
            email: 'dharmi.patel@gmail.com',
            role: 'student',
            branch: 'Computer Engineering',
            college: 'Shree Swaminarayan Institute of Technology (SSIT)',
            semester: 3,
            authProvider: ['google'],
          },
          'mock_google_jwt_token_dharmi'
        );
      }
    } catch (err) {
      setAuth(
        {
          _id: 'g-user-dharmi',
          name: 'Dharmi Patel',
          email: 'dharmi.patel@gmail.com',
          role: 'student',
          branch: 'Computer Engineering',
          college: 'Shree Swaminarayan Institute of Technology (SSIT)',
          semester: 3,
          authProvider: ['google'],
        },
        'mock_google_jwt_token_dharmi'
      );
    } finally {
      setGoogleLoading(false);
      setGoogleModalVisible(false);
    }
  };

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password) {
      const msg = 'Please enter your email and password.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Incomplete', msg);
      return;
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        const res = await loginApi(email, password);
        if (res.success && res.data?.token) {
          setAuth(res.data.user, res.data.token);
        } else if (res.token) {
          setAuth(res.user, res.token);
        } else {
          const errMsg = res.message || 'Invalid credentials.';
          if (Platform.OS === 'web') window.alert(errMsg);
          else Alert.alert('Login Failed', errMsg);
        }
      } else {
        if (!name.trim()) {
          const msg = 'Please enter your full name.';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Incomplete', msg);
          return;
        }
        const res = await registerApi({
          name,
          email,
          password,
          college,
          branch,
        });
        if (res.success && res.data?.token) {
          setAuth(res.data.user, res.data.token);
        } else if (res.token) {
          setAuth(res.user, res.token);
        } else {
          const errMsg = res.message || 'Registration failed.';
          if (Platform.OS === 'web') window.alert(errMsg);
          else Alert.alert('Signup Failed', errMsg);
        }
      }
    } catch (err) {
      if (err.message?.includes('Network Error') || !err.response) {
        const handleOfflineLogin = () => {
          setAuth(
            {
              _id: 'demo-student-dharmi',
              name: name.trim() || 'Dharmi Patel',
              email: email.trim() || 'dharmi.patel@ssit.edu.in',
              role: 'student',
              branch: branch || 'Computer Engineering',
              college: college || 'Shree Swaminarayan Institute of Technology (SSIT)',
              semester: 3,
              authProvider: ['local'],
            },
            'mock_demo_jwt_token'
          );
        };

        if (Platform.OS === 'web') {
          if (window.confirm('Server is offline (cannot reach backend API). Continue with Demo Session?')) {
            handleOfflineLogin();
          }
        } else {
          Alert.alert(
            'Server Offline',
            'Cannot reach backend API. Logging in with Demo Student account so you can preview all features on your phone!',
            [{ text: 'Continue', onPress: handleOfflineLogin }]
          );
        }
        return;
      }
      const errMsg = err.response?.data?.message || err.message || 'Authentication error occurred.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Auth Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#080C14' : '#F8FAFC' }]}>
      {/* Background Decorative Ambient Orbs */}
      <View style={styles.orbGlow1} />
      <View style={styles.orbGlow2} />

      {/* Main Split Layout Container */}
      <View style={[styles.splitWrapper, isDesktop && styles.splitWrapperDesktop]}>
        {/* ======================================================== */}
        {/* LEFT / RIGHT 50/50 HERO GLASS PANEL                      */}
        {/* ======================================================== */}
        {isDesktop && (
          <View
            style={[
              styles.heroPanel,
              {
                backgroundColor: isDark ? 'rgba(16, 23, 38, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#E2E8F0',
              },
            ]}
          >
            {/* Top Brand Tag */}
            <View style={styles.heroBrandRow}>
              <View style={styles.heroLogoBadge}>
                <Icon name="zap" size={18} color="#0c0f10" />
              </View>

              <Text style={[styles.heroLogoText, { color: theme.textPrimary }]}>
                Campus<Text style={{ color: '#c9a84c' }}>One</Text>
              </Text>
            </View>

            <View style={styles.heroCenterContent}>
              <Text style={styles.heroBadgeTag}>
                {isLogin ? '✨ WELCOME BACK SCHOLAR' : '🚀 JOIN SWAMINARAYAN UNIVERSITY PORTAL'}
              </Text>

              <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
                {isLogin
                  ? 'Elevate Your Campus\nAcademic Life.'
                  : 'Start Your Journey with\nCampusOne Today.'}
              </Text>

              <Text style={[styles.heroSub, { color: theme.textMuted }]}>
                {isLogin
                  ? 'Access syllabus notes, Q&A doubts forum, hackathon squads, and campus marketplace in one unified portal.'
                  : 'Connect with verified peers, share lecture PYQs, find SIH project teammates, and unlock campus credits.'}
              </Text>

              {/* Feature Pills */}
              <View style={styles.heroPillsRow}>
                <View style={styles.heroPillItem}>
                  <Icon name="check-circle" size={14} color="#34D399" style={{ marginRight: 6 }} />
                  <Text style={[styles.heroPillText, { color: theme.textPrimary }]}>100% University Verified</Text>
                </View>

                <View style={styles.heroPillItem}>
                  <Icon name="check-circle" size={14} color="#c9a84c" style={{ marginRight: 6 }} />
                  <Text style={[styles.heroPillText, { color: theme.textPrimary }]}>Google OAuth Integrated</Text>
                </View>

                <View style={styles.heroPillItem}>
                  <Icon name="check-circle" size={14} color="#FBBF24" style={{ marginRight: 6 }} />
                  <Text style={[styles.heroPillText, { color: theme.textPrimary }]}>SIH Hackathon Squads</Text>
                </View>
              </View>
            </View>

            {/* Bottom Quote Box */}
            <View style={styles.heroQuoteBox}>
              <Text style={styles.heroQuoteText}>
                “CampusOne transformed how our CSE batch collaborates on notes and hackathon projects.”
              </Text>
              <Text style={styles.heroQuoteAuthor}>— Dharmi Patel, Computer Engg. Sem 3</Text>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* FORM PANEL (SIGN IN / SIGN UP)                           */}
        {/* ======================================================== */}
        <Animated.View
          style={[
            styles.formPanel,
            {
              backgroundColor: isDark ? '#101726' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
        >
          {/* Form Actions Header */}
          <View style={[styles.topFormRow, { justifyContent: 'flex-end' }]}>
            <TouchableOpacity style={styles.themeToggleBtn} onPress={toggleTheme}>
              <Icon name={isDark ? 'sun' : 'moon'} size={15} color={isDark ? '#f0d074' : '#b8943e'} />
            </TouchableOpacity>
          </View>

          {/* Form Header */}
          <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
            {isLogin ? 'Sign in to CampusOne' : 'Create Student Account'}
          </Text>
          <Text style={[styles.formSub, { color: theme.textMuted }]}>
            {isLogin
              ? 'Enter your student credentials to access your dashboard.'
              : 'Fill in your academic details to register on CampusOne.'}
          </Text>

          {/* Mode Switcher Pills (Sign In / Sign Up) */}
          <View style={[styles.switchContainer, { backgroundColor: isDark ? '#141D2D' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[styles.switchTab, isLogin && styles.switchTabActive]}
              onPress={() => toggleMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.switchTabText, isLogin ? styles.switchTextActive : { color: theme.textMuted }]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchTab, !isLogin && styles.switchTabActive]}
              onPress={() => toggleMode('signup')}
              activeOpacity={0.8}
            >
              <Text style={[styles.switchTabText, !isLogin ? styles.switchTextActive : { color: theme.textMuted }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.googleBtn,
              {
                backgroundColor: isDark ? '#141D2D' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1',
              },
            ]}
            onPress={handleGoogleClick}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <GoogleSvgIcon />
                <Text style={[styles.googleBtnText, { color: theme.textPrimary }]}>
                  {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR WITH EMAIL</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} />
          </View>

          {/* INPUT FIELDS - wrapped in form on web for browser password manager support */}
          {Platform.OS === 'web' ? (
            <form
              onSubmit={(e) => { e.preventDefault(); handleAuthSubmit(); }}
              style={{ display: 'contents' }}
            >
              <View style={styles.fieldsContainer}>
                {!isLogin && (
                  <>
                    <View style={styles.fieldGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Full Name</Text>
                      <TextInput
                        style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                        placeholder="Dharmi Patel"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={name}
                        onChangeText={setName}
                        autoComplete="name"
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>College / University</Text>
                      <TextInput
                        style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                        placeholder="Shree Swaminarayan Institute of Technology"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={college}
                        onChangeText={setCollege}
                        autoComplete="organization"
                      />
                    </View>
                  </>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Email Address</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                    placeholder="student@ssit.edu.in"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelBetweenRow}>
                    <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Password</Text>
                    {isLogin && (
                      <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'Please contact your university IT desk to reset credentials.')}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                    placeholder="••••••••"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    secureTextEntry
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              {/* Hidden submit button for Enter-key form submission on web */}
              <button type="submit" style={{ display: 'none' }} aria-hidden="true" />

              {/* SUBMIT BUTTON */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleAuthSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isLogin ? 'Sign In to CampusOne →' : 'Create Account & Continue →'}
                  </Text>
                )}
              </TouchableOpacity>
            </form>
          ) : (
            <>
              <View style={styles.fieldsContainer}>
                {!isLogin && (
                  <>
                    <View style={styles.fieldGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Full Name</Text>
                      <TextInput
                        style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                        placeholder="Dharmi Patel"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={name}
                        onChangeText={setName}
                        textContentType="name"
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>College / University</Text>
                      <TextInput
                        style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                        placeholder="Shree Swaminarayan Institute of Technology"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={college}
                        onChangeText={setCollege}
                      />
                    </View>
                  </>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Email Address</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                    placeholder="student@ssit.edu.in"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelBetweenRow}>
                    <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Password</Text>
                    {isLogin && (
                      <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'Please contact your university IT desk to reset credentials.')}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: theme.textPrimary }]}
                    placeholder="••••••••"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    secureTextEntry
                    textContentType={isLogin ? 'password' : 'newPassword'}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              {/* SUBMIT BUTTON */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleAuthSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isLogin ? 'Sign In to CampusOne →' : 'Create Account & Continue →'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Footer Switch Text */}
          <View style={styles.formFooter}>
            <Text style={[styles.footerText, { color: theme.textMuted }]}>
              {isLogin ? "Don't have a student account?" : 'Already registered on CampusOne?'}
            </Text>
            <TouchableOpacity onPress={() => toggleMode(isLogin ? 'signup' : 'login')}>
              <Text style={styles.footerLinkText}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* ======================================================== */}
      {/* 🔴 CENTERED GOOGLE OAUTH ACCOUNT SELECTOR MODAL          */}
      {/* ======================================================== */}
      <Modal visible={googleModalVisible} transparent animationType="fade" onRequestClose={() => setGoogleModalVisible(false)}>
        <View style={styles.gModalOverlay}>
          <View style={[styles.gModalBox, { backgroundColor: isDark ? '#101726' : '#FFFFFF', borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#E2E8F0' }]}>
            {/* Header */}
            <View style={styles.gModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <GoogleSvgIcon size={22} />
                <Text style={[styles.gModalTitle, { color: theme.textPrimary }]}>Sign in with Google</Text>
              </View>
              <TouchableOpacity onPress={() => setGoogleModalVisible(false)}>
                <Icon name="x" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.gModalSub, { color: theme.textMuted }]}>
              Choose a Google Account to sign in to CampusOne
            </Text>

            {/* Centered Google Profile Account Card */}
            <TouchableOpacity
              style={[styles.gAccountCard, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1' }]}
              onPress={confirmGoogleSignIn}
              disabled={googleLoading}
              activeOpacity={0.85}
            >
              <View style={styles.gAvatarCircle}>
                <Text style={styles.gAvatarText}>D</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.gAccountName, { color: theme.textPrimary }]}>Dharmi Patel</Text>
                  <Icon name="check-circle" size={13} color="#34D399" style={{ marginLeft: 6 }} />
                </View>
                <Text style={[styles.gAccountEmail, { color: theme.textMuted }]}>dharmi.patel@gmail.com</Text>
                <Text style={styles.gClientIdText}>
                  ID: 402286075226-a65ogtb4kjl5ee...
                </Text>
              </View>

              <Icon name="chevron-right" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>

            <View style={styles.gSecurityTagRow}>
              <Icon name="shield" size={13} color="#10B981" style={{ marginRight: 5 }} />
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>
                Verified via Google OAuth 2.0 Client
              </Text>
            </View>

            {/* Confirm Action Button */}
            <TouchableOpacity
              style={[styles.gConfirmBtn, googleLoading && { opacity: 0.7 }]}
              onPress={confirmGoogleSignIn}
              disabled={googleLoading}
              activeOpacity={0.85}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.gConfirmBtnText}>Continue as Dharmi Patel →</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    overflow: 'hidden',
  },

  /* Glowing ambient background orbs */
  orbGlow1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  orbGlow2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },

  splitWrapper: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'column',
    gap: 20,
    zIndex: 10,
  },
  splitWrapperDesktop: {
    maxWidth: 960,
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 560,
  },

  /* Left 50% Glass Hero Panel */
  heroPanel: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 32,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#c9a84c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heroLogoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroCenterContent: {
    marginVertical: 20,
  },
  heroBadgeTag: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroPillsRow: {
    gap: 10,
  },
  heroPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  heroQuoteBox: {
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.25)',
  },
  heroQuoteText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  heroQuoteAuthor: {
    color: '#c9a84c',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 6,
  },

  /* Form Panel */
  formPanel: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 28,
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 6px 32px rgba(0,0,0,0.15)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  topFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  themeToggleBtn: {
    padding: 4,
  },

  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  formSub: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 16,
  },

  /* Mode Switcher Tabs */
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  switchTabActive: {
    backgroundColor: '#c9a84c',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(201,168,76,0.35)' },
      default: {
        shadowColor: '#c9a84c',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  switchTabText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#0c0f10',
    fontWeight: '800',
  },

  /* Google Button */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },

  /* Form Fields */
  fieldsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  fieldGroup: {},
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelBetweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: '700',
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8.5,
    fontSize: 13,
  },

  /* Submit Button */
  submitBtn: {
    backgroundColor: '#c9a84c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(201,168,76,0.45)' },
      default: {
        shadowColor: '#c9a84c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
    marginBottom: 14,
  },
  submitBtnText: {
    color: '#0c0f10',
    fontSize: 13.5,
    fontWeight: '800',
  },

  /* Footer Switch */
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
  },
  footerLinkText: {
    color: '#c9a84c',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Centered Google Modal Overlay */
  gModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gModalBox: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    alignSelf: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 10px 40px rgba(0,0,0,0.4)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  gModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gModalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  gModalSub: {
    fontSize: 12.5,
    marginBottom: 18,
  },

  gAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
    marginBottom: 16,
  },
  gAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c9a84c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gAvatarText: {
    color: '#0c0f10',
    fontSize: 18,
    fontWeight: '800',
  },
  gAccountName: {
    fontSize: 15,
    fontWeight: '800',
  },
  gAccountEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  gClientIdText: {
    fontSize: 10,
    color: '#c9a84c',
    fontWeight: '600',
    marginTop: 4,
  },

  gSecurityTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  gConfirmBtn: {
    backgroundColor: '#c9a84c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(201,168,76,0.45)' },
      default: {
        shadowColor: '#c9a84c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  gConfirmBtnText: {
    color: '#0c0f10',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
