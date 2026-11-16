import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  StatusBar,
} from 'react-native';

export default function SplashScreen({ onFinish, logoSource }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.92));
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoTimerRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const finishedRef = useRef(false);

  const dismiss = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    // Clear any pending timers
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    // Fade out then call onFinish
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  useEffect(() => {
    // Smooth entrance animation (fade + scale)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Safety fallback: dismiss after 3s regardless of image load state
    fallbackTimerRef.current = setTimeout(dismiss, 3000);

    return () => {
      if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  // Start 500ms hold timer ONLY after logo image has fully loaded
  useEffect(() => {
    if (!logoLoaded) return;
    // Cancel fallback — logo loaded, we control timing now
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    // Wait 500ms so user clearly sees the logo
    logoTimerRef.current = setTimeout(dismiss, 500);
  }, [logoLoaded]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16A36A" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={
              typeof logoSource === 'string' ? { uri: logoSource } : logoSource
            }
            style={styles.logoImage}
            resizeMode="cover"
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoLoaded(true)} // also dismiss on error
          />
        </View>

        <Text style={styles.appName}>CampusOne</Text>
        <Text style={styles.appTagline}>Smart Campus Ecosystem</Text>

        <View style={styles.loadingBarWrapper}>
          <View style={styles.loadingBarTrack}>
            <View style={styles.loadingBarFill} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A36A',
    letterSpacing: 0.5,
  },
  loadingBarWrapper: {
    marginTop: 32,
    width: 140,
  },
  loadingBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  loadingBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#16A36A',
  },
});
