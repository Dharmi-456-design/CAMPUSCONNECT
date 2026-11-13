import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

type TabIconProps = {
  focused: boolean;
  label: string;
  emoji: string;
};

function TabIcon({ focused, label, emoji }: TabIconProps) {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.emojiContainer, focused && styles.emojiContainerActive]}>
        <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Home" emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="academics"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Academics" emoji="📚" />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Events" emoji="📅" />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Community" emoji="🤝" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Profile" emoji="👤" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  emojiContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emojiContainerActive: {
    backgroundColor: '#E8F5EE',
  },
  emoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  emojiFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#16A36A',
    fontWeight: '700',
  },
});
