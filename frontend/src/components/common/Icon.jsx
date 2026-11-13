import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

export default function Icon({ name, size = 20, color = '#1E293B', style }) {
  // Normalize icon name (e.g. 'search' -> 'Search', 'arrow-right' -> 'ArrowRight')
  const formattedName = name
    ? name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
    : 'HelpCircle';

  const LucideComponent = LucideIcons[formattedName] || LucideIcons[name] || LucideIcons.HelpCircle;

  if (LucideComponent) {
    return (
      <View style={[styles.container, style]}>
        <LucideComponent size={size} color={color} strokeWidth={1.75} />
      </View>
    );
  }

  // Fallback map
  const fallbackEmojis = {
    Search: '🔍',
    Book: '📚',
    HelpCircle: '❓',
    Users: '👥',
    ShoppingBag: '🛒',
    MessageSquare: '💬',
    User: '👤',
    Shield: '🛡️',
    Sparkles: '✨',
    Star: '⭐',
    Building: '🏛️',
    Flame: '🔥',
    LogOut: '🚪',
    ArrowRight: '→',
    ArrowLeft: '←',
    Check: '✓',
    Bell: '🔔'
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={{ fontSize: size * 0.9, color }}>{fallbackEmojis[formattedName] || '●'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
