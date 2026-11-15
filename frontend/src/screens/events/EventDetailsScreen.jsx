import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from '../../components/common/Icon';
import {
  registerForEventApi,
  cancelEventRegistrationApi,
  deleteEventApi,
} from '../../api/events.api';
import { useAuthStore } from '../../store/authStore';

export default function EventDetailsScreen({
  event,
  onBack,
  onEdit,
  onEventUpdated,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'faculty';

  const [currentEvent, setCurrentEvent] = useState(event);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentEvent) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>Event details unavailable.</Text>
        <TouchableOpacity style={styles.backBtnSolid} onPress={onBack}>
          <Text style={styles.backBtnSolidText}>Back to Events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isRegistered = Boolean(currentEvent.isRegistered);
  const registeredCount = currentEvent.registeredCount || 0;
  const capacity = currentEvent.capacity || 100;
  const isFull = registeredCount >= capacity;
  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await registerForEventApi(currentEvent._id);
      const updated = res.data?.event || {
        ...currentEvent,
        isRegistered: true,
        registeredCount: registeredCount + 1,
      };
      setCurrentEvent(updated);
      setSuccessMsg('🎉 You have successfully registered for this event!');
      if (onEventUpdated) onEventUpdated(updated);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = () => {
    const doCancel = async () => {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        await cancelEventRegistrationApi(currentEvent._id);
        const updated = {
          ...currentEvent,
          isRegistered: false,
          registeredCount: Math.max(0, registeredCount - 1),
        };
        setCurrentEvent(updated);
        setSuccessMsg('Your registration has been cancelled.');
        if (onEventUpdated) onEventUpdated(updated);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to cancel registration');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel your registration?')) {
        doCancel();
      }
    } else {
      Alert.alert(
        'Cancel Registration',
        'Are you sure you want to cancel your seat for this event?',
        [
          { text: 'Keep My Seat', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: doCancel },
        ]
      );
    }
  };

  const handleDeleteEvent = () => {
    const doDelete = async () => {
      setLoading(true);
      try {
        await deleteEventApi(currentEvent._id);
        if (onEventUpdated) onEventUpdated(null, currentEvent._id);
        onBack();
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to delete event');
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete event "${currentEvent.title}"?`)) doDelete();
    } else {
      Alert.alert('Delete Event', `Delete event "${currentEvent.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const formattedDate = currentEvent.date
    ? new Date(currentEvent.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <View style={styles.root}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color="#0F172A" />
          <Text style={styles.backBtnText}>Events</Text>
        </TouchableOpacity>

        {isAdmin ? (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={[styles.smallBtn, styles.editBtn]}
              onPress={() => onEdit && onEdit(currentEvent)}
            >
              <Icon name="edit-2" size={14} color="#16A36A" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallBtn, styles.deleteBtn]}
              onPress={handleDeleteEvent}
              disabled={loading}
            >
              <Icon name="trash-2" size={14} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, isDesktop && styles.desktopContainer]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {currentEvent.imageUrl ? (
          <Image source={{ uri: currentEvent.imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Icon name="calendar" size={48} color="#A7F3D0" />
          </View>
        )}

        {/* Feedback Messages */}
        {successMsg ? (
          <View style={styles.successBox}>
            <Icon name="check-circle" size={18} color="#065F46" />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Icon name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorBoxText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Category & Status */}
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{currentEvent.category || 'Campus Event'}</Text>
          </View>

          {isRegistered ? (
            <View style={styles.registeredBadge}>
              <Icon name="check" size={12} color="#16A36A" style={{ marginRight: 4 }} />
              <Text style={styles.registeredBadgeText}>Confirmed Seat</Text>
            </View>
          ) : isFull ? (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>Full Capacity</Text>
            </View>
          ) : null}
        </View>

        {/* Title & Organizer */}
        <Text style={styles.title}>{currentEvent.title}</Text>
        <Text style={styles.organizer}>
          Organized by <Text style={styles.organizerBold}>{currentEvent.organizer || 'Student Council'}</Text>
        </Text>

        {/* Date, Time & Venue Cards */}
        <View style={styles.metaCardsRow}>
          <View style={styles.metaCard}>
            <View style={[styles.metaIconCircle, { backgroundColor: '#E8F5EE' }]}>
              <Icon name="calendar" size={18} color="#16A36A" />
            </View>
            <View style={styles.metaCardText}>
              <Text style={styles.metaLabel}>Date & Time</Text>
              <Text style={styles.metaValue}>
                {formattedDate} {currentEvent.time ? `• ${currentEvent.time}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.metaCard}>
            <View style={[styles.metaIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="map-pin" size={18} color="#3B82F6" />
            </View>
            <View style={styles.metaCardText}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{currentEvent.venue || 'Campus Auditorium'}</Text>
            </View>
          </View>
        </View>

        {/* Capacity Progress Bar */}
        <View style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityLabel}>Seat Availability</Text>
            <Text style={styles.capacityCount}>
              {registeredCount} / {capacity} seats booked ({percentFilled}%)
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentFilled}%` },
                isFull && { backgroundColor: '#EF4444' },
              ]}
            />
          </View>
        </View>

        {/* Perks / Highlights */}
        {currentEvent.perks && currentEvent.perks.length > 0 ? (
          <View style={styles.perksRow}>
            {currentEvent.perks.map((perk, idx) => (
              <View key={idx} style={styles.perkChip}>
                <Icon name="sparkles" size={12} color="#16A36A" style={{ marginRight: 4 }} />
                <Text style={styles.perkChipText}>{perk}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Description */}
        <Text style={styles.descHeading}>About Event</Text>
        <Text style={styles.description}>{currentEvent.description}</Text>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomSeatsLeft}>
            {Math.max(0, capacity - registeredCount)} seats remaining
          </Text>
          <Text style={styles.bottomFreeText}>Free Campus Entry</Text>
        </View>

        {isRegistered ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={handleCancelRegistration}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Icon name="x-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.cancelBtnText}>Cancel Seat</Text>
              </>
            )}
          </TouchableOpacity>
        ) : isFull ? (
          <View style={[styles.actionBtn, styles.disabledBtn]}>
            <Text style={styles.disabledBtnText}>Event Full</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.registerBtn]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.registerBtnText}>Register Now</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  editBtn: {
    backgroundColor: '#E8F5EE',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A36A',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  desktopContainer: {
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backBtnSolid: {
    backgroundColor: '#16A36A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnSolidText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  successText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorBoxText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  registeredBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A36A',
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fullBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 32,
    marginBottom: 4,
  },
  organizer: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
  },
  organizerBold: {
    color: '#0F172A',
    fontWeight: '600',
  },
  metaCardsRow: {
    gap: 10,
    marginBottom: 18,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  metaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCardText: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 1,
  },
  capacityCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  capacityCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A36A',
    borderRadius: 4,
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  perkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  perkChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A36A',
  },
  descHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomSeatsLeft: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  bottomFreeText: {
    fontSize: 12,
    color: '#16A36A',
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 150,
  },
  registerBtn: {
    backgroundColor: '#16A36A',
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  disabledBtn: {
    backgroundColor: '#E2E8F0',
  },
  disabledBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
