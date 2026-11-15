import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../components/common/Icon';

export default function EventCard({
  event,
  onPress,
  onRegisterPress,
  onCancelPress,
}) {
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
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Hero Image */}
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Icon name="calendar" size={32} color="#16A36A" />
        </View>
      )}

      <View style={styles.cardBody}>
        {/* Category & Status */}
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{event.category || 'Event'}</Text>
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

        {/* Title & Organizer matching reference */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <Text style={styles.organizer} numberOfLines={1}>
          Organized by <Text style={styles.organizerBold}>{event.organizer || 'Student Services'}</Text>
        </Text>

        {/* Venue & Date with icons matching reference */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="map-pin" size={14} color="#16A36A" style={{ marginRight: 4 }} />
            <Text style={styles.infoText} numberOfLines={1}>
              {event.venue || 'Campus Auditorium'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="calendar" size={14} color="#16A36A" style={{ marginRight: 4 }} />
            <Text style={styles.infoText} numberOfLines={1}>
              {formattedDate} {event.time ? `, ${event.time}` : ''}
            </Text>
          </View>
        </View>

        {/* Description Snippet */}
        <Text style={styles.descSnippet} numberOfLines={2}>
          {event.description}
        </Text>

        {/* Perks / Tags Chips */}
        {event.perks && event.perks.length > 0 ? (
          <View style={styles.perksRow}>
            {event.perks.map((perk, idx) => (
              <View key={idx} style={styles.perkChip}>
                <Text style={styles.perkChipText}>{perk}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Bottom Card Action */}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  registeredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A36A',
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
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 4,
  },
  organizer: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  organizerBold: {
    color: '#0F172A',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  descSnippet: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  perkChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  perkChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  freeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A36A',
    letterSpacing: 0.5,
  },
  registerSmallBtn: {
    backgroundColor: '#16A36A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  registerSmallBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelSmallBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  cancelSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  fullSmallBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  fullSmallBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
