import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';

export default function EventCard({
  event,
  onPress,
  onRegisterPress,
  onCancelPress,
  isDark: propIsDark,
}) {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const isRegistered = Boolean(event.isRegistered);
  const capacity = event.capacity || 100;
  const registeredCount = event.registeredCount || 0;
  const isFull = registeredCount >= capacity;

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
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
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Event Hero Image matching Image 1 */}
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
          <Icon name="calendar" size={36} color="#16A36A" />
        </View>
      )}

      <View style={styles.cardBody}>
        {/* Category & Registration Status Row matching Image 2 */}
        <View style={styles.topRow}>
          <View style={styles.categoryRow}>
            <Icon name="users" size={13} color="#16A36A" />
            <Text style={styles.categoryText}>
              {event.category || 'Clubs and Orgs'}
            </Text>
          </View>

          {isRegistered ? (
            <View style={styles.registeredBadge}>
              <Icon name="check" size={11} color="#16A36A" style={{ marginRight: 3 }} />
              <Text style={styles.registeredBadgeText}>Registered</Text>
            </View>
          ) : isFull ? (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>Full</Text>
            </View>
          ) : (
            <Text style={styles.seatsLeftText}>
              {capacity - registeredCount} seats left
            </Text>
          )}
        </View>

        {/* Title matching Image 1 & 2 */}
        <Text
          style={[
            styles.title,
            { color: isDark ? '#F8FAFC' : '#0F172A' },
          ]}
          numberOfLines={2}
        >
          {event.title}
        </Text>

        {/* Organizer Subtitle matching Image 1 ("Organized by ...") */}
        <Text style={styles.organizerText} numberOfLines={1}>
          Organized by <Text style={styles.organizerBold}>{event.organizer || 'International Student Services'}</Text>
        </Text>

        {/* Venue & Date with Emerald Icons matching Image 1 */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="map-pin" size={14} color="#16A36A" style={{ marginRight: 4 }} />
            <Text
              style={[
                styles.metaText,
                { color: isDark ? '#CBD5E1' : '#334155' },
              ]}
              numberOfLines={1}
            >
              {event.venue || 'Campus Hall'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="calendar" size={14} color="#16A36A" style={{ marginRight: 4 }} />
            <Text
              style={[
                styles.metaText,
                { color: isDark ? '#CBD5E1' : '#334155' },
              ]}
              numberOfLines={1}
            >
              {formattedDate} {event.time ? `, ${event.time}` : ''}
            </Text>
          </View>
        </View>

        {/* Description snippet */}
        <Text
          style={[
            styles.descSnippet,
            { color: isDark ? '#94A3B8' : '#64748B' },
          ]}
          numberOfLines={2}
        >
          {event.description}
        </Text>

        {/* Perks list e.g. "Free lunch!! Hiring!!" from Image 2 */}
        {event.perks && event.perks.length > 0 ? (
          <View style={styles.perksRow}>
            {event.perks.map((perk, idx) => (
              <View key={idx} style={styles.perkChip}>
                <Text style={styles.perkChipText}>{perk}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Card Footer Actions */}
        <View style={styles.cardFooter}>
          <Text style={styles.freeBadge}>FREE ENTRY</Text>

          {isRegistered ? (
            <TouchableOpacity
              style={styles.cancelSmallBtn}
              onPress={(e) => {
                e.stopPropagation();
                if (onCancelPress) onCancelPress(event);
              }}
            >
              <Text style={styles.cancelSmallBtnText}>Cancel Seat</Text>
            </TouchableOpacity>
          ) : isFull ? (
            <View style={styles.fullSmallBtn}>
              <Text style={styles.fullSmallBtnText}>Sold Out</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.registerSmallBtn}
              onPress={(e) => {
                e.stopPropagation();
                if (onRegisterPress) onRegisterPress(event);
              }}
            >
              <Text style={styles.registerSmallBtnText}>Register Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 170,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A36A',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  registeredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fullBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  seatsLeftText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 4,
  },
  organizerText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  organizerBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  descSnippet: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  perkChip: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  perkChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  freeBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A36A',
    letterSpacing: 0.5,
  },
  registerSmallBtn: {
    backgroundColor: '#16A36A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  registerSmallBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelSmallBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cancelSmallBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  fullSmallBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  fullSmallBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
});
