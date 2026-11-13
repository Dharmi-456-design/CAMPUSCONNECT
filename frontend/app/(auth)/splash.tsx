import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { router } from 'expo-router';

/**
 * CampusOne Splash Screen
 * Features emerald green branding and university super app title
 */
export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brandContainer, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🎓</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.titleBold}>Campus</Text>
          <Text style={styles.titlePrimary}>One</Text>
        </View>
        <Text style={styles.subtitle}>Student Life Super App</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dotPulse} />
        <Text style={styles.footerText}>Powered by CampusOne Architecture</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 48,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  titleBold: {
    fontSize: 34,
    fontWeight: '800',
    color: '#172B4D',
    letterSpacing: -0.5,
  },
  titlePrimary: {
    fontSize: 34,
    fontWeight: '800',
    color: '#16A36A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 8,
  },
  dotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A36A',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
