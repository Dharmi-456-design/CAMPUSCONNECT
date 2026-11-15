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
        styles.gridCard,
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isDark ? '#334155' : '#F1F5F9',
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Thumbnail Matching Image 3 */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.imageUrl || defaultImg }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Type pill badge */}
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

      {/* Meta Content */}
      <View style={styles.cardInfo}>
        <Text
          style={[
            styles.itemTitle,
            { color: isDark ? '#F8FAFC' : '#0F172A' },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Icon name="map-pin" size={11} color="#16A36A" />
          <Text
            style={[
              styles.locationText,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}
            numberOfLines={1}
          >
            {item.location || 'Campus'}
          </Text>
        </View>

        <View style={styles.bottomMetaRow}>
          <Text style={styles.dateLabel}>{dateStr}</Text>
          <View
            style={[
              styles.catBadge,
              { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
            ]}
          >
            <Text
              style={[
                styles.catBadgeText,
                { color: isDark ? '#94A3B8' : '#475569' },
              ]}
              numberOfLines={1}
            >
              {item.category || 'General'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    maxWidth: '50%',
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  claimedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  claimedBadgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  dateLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 70,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
