import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { createLostFoundItemApi } from '../../api/lostFound.api';

const CATEGORIES = [
  'Wallets & Bags',
  'Electronics',
  'ID Cards',
  'Books & Notes',
  'Keys',
  'Watches & Jewelry',
  'Clothing',
  'Accessories',
  'Other',
];

export default function AddLostFoundModal({ visible, currentUser, onClose, onItemCreated }) {
  const [type, setType] = useState('FOUND');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wallets & Bags');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Contact Info
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an item title');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Required', 'Please enter where this item was lost or found');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please provide a brief description');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type,
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        contactInfo: {
          name: contactName.trim() || currentUser?.name || 'Anonymous',
          phone: contactPhone.trim(),
          email: contactEmail.trim() || currentUser?.email || '',
          showPhone,
          showEmail,
        },
      };

      const res = await createLostFoundItemApi(payload);
      Alert.alert('Success', `Report for "${title}" posted successfully!`);
      // Reset form
      setTitle('');
      setLocation('');
      setDescription('');
      setImageUrl('');
      if (onItemCreated) onItemCreated(res.data);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="x" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.sheetHeaderTitle}>Report Item</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Type Switcher */}
            <Text style={styles.fieldLabel}>Report Type *</Text>
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'LOST' && styles.typeBtnActiveLost,
                ]}
                onPress={() => setType('LOST')}
              >
                <Icon
                  name="help-circle"
                  size={16}
                  color={type === 'LOST' ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'LOST' && styles.typeBtnTextActive,
                  ]}
                >
                  I Lost An Item
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'FOUND' && styles.typeBtnActiveFound,
                ]}
                onPress={() => setType('FOUND')}
              >
                <Icon
                  name="check-circle"
                  size={16}
                  color={type === 'FOUND' ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'FOUND' && styles.typeBtnTextActive,
                  ]}
                >
                  I Found An Item
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.fieldLabel}>Item Name / Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Brown leather wallet, Casio watch..."
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    category === cat && styles.catChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      category === cat && styles.catChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Location */}
            <Text style={styles.fieldLabel}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bulman Centre, Library 2nd Floor, Room 304..."
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Item Details & Identifying Marks *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe color, brand, contents, condition, or any specific details..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            {/* Image URL */}
            <Text style={styles.fieldLabel}>Image Link (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#94A3B8"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />

            {/* Privacy & Contact Details */}
            <View style={styles.privacyCard}>
              <Text style={styles.privacyCardTitle}>Contact & Privacy Controls</Text>

              <Text style={styles.subLabel}>Reporter Name</Text>
              <TextInput
                style={styles.subInput}
                placeholder="Your Name"
                placeholderTextColor="#94A3B8"
                value={contactName}
                onChangeText={setContactName}
              />

              <Text style={styles.subLabel}>Phone Number</Text>
              <TextInput
                style={styles.subInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Show phone number publicly</Text>
                <Switch
                  value={showPhone}
                  onValueChange={setShowPhone}
                  trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                  thumbColor={showPhone ? '#16A36A' : '#F1F5F9'}
                />
              </View>

              <Text style={styles.subLabel}>Email Address</Text>
              <TextInput
                style={styles.subInput}
                placeholder="your.email@campus.edu"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={contactEmail}
                onChangeText={setContactEmail}
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Show email address publicly</Text>
                <Switch
                  value={showEmail}
                  onValueChange={setShowEmail}
                  trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                  thumbColor={showEmail ? '#16A36A' : '#F1F5F9'}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Item Report</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    minHeight: '60%',
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  typeSwitcher: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  typeBtnActiveLost: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  typeBtnActiveFound: {
    backgroundColor: '#16A36A',
    borderColor: '#16A36A',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#16A36A',
    borderColor: '#16A36A',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  privacyCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  privacyCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  subInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  submitBtn: {
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
