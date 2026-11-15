import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../components/common/Icon';

export default function LostFoundCard({ item, onPress, isDark, theme }) {
  const isLost = item.type === 'LOST';
  const isClaimed = item.status === 'CLAIMED' || item.status === 'RESOLVED';

  const defaultImg = isLost
    ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80';

  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isDark ? '#334155' : '#E2E8F0',
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Thumbnail */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl || defaultImg }}
          style={styles.image}
          resizeMode="cover"
        />
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: isLost ? '#EF4444' : '#16A36A' },
          ]}
        >
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>

        {isClaimed && (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedBadgeText}>{item.status}</Text>
          </View>
        )}
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: isDark ? '#F8FAFC' : '#0F172A' },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Icon name="map-pin" size={13} color="#16A36A" />
          <Text
            style={[
              styles.metaText,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}
            numberOfLines={1}
          >
            {item.location}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.dateRow}>
            <Icon name="calendar" size={12} color="#94A3B8" />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>

          <View
            style={[
              styles.categoryChip,
              { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: isDark ? '#94A3B8' : '#475569' },
              ]}
              numberOfLines={1}
            >
              {item.category}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  claimedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  claimedBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 120,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
