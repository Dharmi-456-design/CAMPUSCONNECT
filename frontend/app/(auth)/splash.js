import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

/**
 * Polished Splash Screen
 * Features animated CampusOne emblem, clean emerald green palette,
 * auto-navigates to onboarding, and supports tap-to-skip.
 */
export default function SplashScreen() {
  const { width } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    router.replace('/(auth)/onboarding');
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleSkip}
      style={styles.container}
    >
      <Animated.View style={[styles.brandBox, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoBadge}>
          <Text style={styles.mortarCap}>🎓</Text>
          <View style={styles.pulseRing} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.titleBold}>Campus</Text>
          <Text style={styles.titlePrimary}>One</Text>
        </View>

        <Animated.View style={{ opacity: subtitleFade, alignItems: 'center' }}>
          <Text style={styles.tagline}>Student Life Super App</Text>
          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>Academics · Events · Community</Text>
          </View>
        </Animated.View>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.footerText}>Tap anywhere to continue</Text>
      </View>
    </TouchableOpacity>
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
  brandBox: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 20,
    position: 'relative',
  },
  mortarCap: {
    fontSize: 52,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(22, 163, 106, 0.25)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  titleBold: {
    fontSize: 36,
    fontWeight: '800',
    color: '#172B4D',
    letterSpacing: -0.5,
  },
  titlePrimary: {
    fontSize: 36,
    fontWeight: '800',
    color: '#16A36A',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  pillContainer: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: {
    color: '#16A36A',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
    gap: 12,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    backgroundColor: '#16A36A',
    width: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
