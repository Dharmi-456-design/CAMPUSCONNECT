import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';

const SLIDES = [
  {
    emoji: '🎓',
    title: 'Your Campus Life,\nAll in One App',
    subtitle: 'From academics and notes to events and community — manage your college journey seamlessly.',
  },
  {
    emoji: '📚',
    title: 'Academics & Notes\nAt Your Fingertips',
    subtitle: 'Access lecture notes, subject syllabus, track credits, and prepare for exams with your peers.',
  },
  {
    emoji: '🤝',
    title: 'Events, Lost & Found\nand Community',
    subtitle: 'Participate in college fests, register for hackathons, ask questions, and report campus items.',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: width * next, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Campus<Text style={{ color: '#16A36A' }}>One</Text></Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.emojiCard}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>
            {activeIndex < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B4D',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emojiCard: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  emoji: {
    fontSize: 54,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172B4D',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: '#16A36A',
    width: 24,
  },
  primaryBtn: {
    backgroundColor: '#16A36A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
