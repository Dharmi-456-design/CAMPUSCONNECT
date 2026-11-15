import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { createEventApi, updateEventApi } from '../../api/events.api';

const EVENT_CATEGORIES = [
  'Technology',
  'Cultural',
  'Sports',
  'Academic',
  'Career',
  'Workshop',
  'Clubs and Orgs',
  'Networking',
  'Other',
];

export default function AdminEventModal({
  visible,
  onClose,
  initialEvent = null,
  onEventSaved,
}) {
  const isEditing = Boolean(initialEvent && initialEvent._id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cultural');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('Student Council');
  const [capacity, setCapacity] = useState('100');
  const [imageUrl, setImageUrl] = useState('');
  const [perksText, setPerksText] = useState('Food Available, Limited seats');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialEvent) {
        setTitle(initialEvent.title || '');
        setDescription(initialEvent.description || '');
        setCategory(initialEvent.category || 'Cultural');
        setDate(
          initialEvent.date ? new Date(initialEvent.date).toISOString().split('T')[0] : ''
        );
        setTime(initialEvent.time || '');
        setVenue(initialEvent.venue || '');
        setOrganizer(initialEvent.organizer || 'Student Council');
        setCapacity(String(initialEvent.capacity || '100'));
        setImageUrl(initialEvent.imageUrl || '');
        setPerksText((initialEvent.perks || []).join(', '));
      } else {
        setTitle('');
        setDescription('');
        setCategory('Cultural');
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        setDate(nextWeek.toISOString().split('T')[0]);
        setTime('5:30 PM');
        setVenue('Bulman centre');
        setOrganizer('International Student Services');
        setCapacity('150');
        setImageUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop');
        setPerksText('Food Available, Limited seats');
      }
      setErrorMsg('');
    }
  }, [visible, initialEvent]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg('Event title is required');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Event description is required');
      return;
    }
    if (!venue.trim()) {
      setErrorMsg('Venue is required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const parsedPerks = perksText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      date: new Date(date || Date.now()).toISOString(),
      time: time.trim() || '10:00 AM',
      venue: venue.trim(),
      organizer: organizer.trim() || 'Student Council',
      capacity: parseInt(capacity, 10) || 100,
      imageUrl: imageUrl.trim(),
      perks: parsedPerks,
    };

    try {
      let saved;
      if (isEditing) {
        const res = await updateEventApi(initialEvent._id, payload);
        saved = res.data?.event;
      } else {
        const res = await createEventApi(payload);
        saved = res.data?.event;
      }
      if (onEventSaved) onEventSaved(saved);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Event' : 'Create Event'}</Text>
              <Text style={styles.modalSub}>Campus Event Management (Admin / Faculty)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>TITLE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Onam Celebration, TechSparks 2026"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {EVENT_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>DATE (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-11-20"
                  placeholderTextColor="#94A3B8"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>TIME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5:30 PM"
                  placeholderTextColor="#94A3B8"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>VENUE *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bulman centre"
                  placeholderTextColor="#94A3B8"
                  value={venue}
                  onChangeText={setVenue}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>CAPACITY *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="150"
                  placeholderTextColor="#94A3B8"
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>ORGANIZER</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. International Student Services, FESA"
              placeholderTextColor="#94A3B8"
              value={organizer}
              onChangeText={setOrganizer}
            />

            <Text style={styles.label}>BANNER IMAGE URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#94A3B8"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <Text style={styles.label}>PERKS / HIGHLIGHTS (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="Food Available, Limited seats, Free lunch!! Hiring!!"
              placeholderTextColor="#94A3B8"
              value={perksText}
              onChangeText={setPerksText}
            />

            <Text style={styles.label}>DESCRIPTION *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed schedule, speakers, and student eligibility..."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>{isEditing ? 'Save Event' : 'Publish Event'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
  scrollBody: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#16A36A',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#16A36A',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
