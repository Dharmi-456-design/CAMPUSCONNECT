import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { updateLostFoundItemApi, deleteLostFoundItemApi } from '../../api/lostFound.api';

export default function LostFoundDetailsModal({
  visible,
  item,
  currentUser,
  onClose,
  onItemUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  if (!item) return null;

  const isOwner =
    currentUser &&
    item.user &&
    (item.user._id ? item.user._id === currentUser._id : item.user === currentUser._id);
  const isAdmin = currentUser?.role === 'admin';
  const canManage = isOwner || isAdmin;

  const isLost = item.type === 'LOST';
  const defaultImg = isLost
    ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80';

  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      const res = await updateLostFoundItemApi(item._id, { status: newStatus });
      Alert.alert('Status Updated', `Item marked as ${newStatus}`);
      if (onItemUpdated) onItemUpdated(res.data);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteLostFoundItemApi(item._id);
              Alert.alert('Deleted', 'Item report removed successfully');
              if (onItemUpdated) onItemUpdated(null, item._id);
              onClose();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Controls */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="x" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.sheetHeaderTitle}>Item Details</Text>
            {canManage ? (
              <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                <Icon name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Image Preview */}
            <View style={styles.imageBox}>
              <Image
                source={{ uri: item.imageUrl || defaultImg }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isLost ? '#EF4444' : '#16A36A' },
                ]}
              >
                <Text style={styles.badgeText}>{item.type}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            {/* Title & Category */}
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.categoryRow}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category}</Text>
              </View>
            </View>

            {/* Location & Date */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="map-pin" size={16} color="#16A36A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Found / Lost Location</Text>
                  <Text style={styles.infoValue}>{item.location}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Icon name="calendar" size={16} color="#16A36A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Reported Date & Time</Text>
                  <Text style={styles.infoValue}>{dateStr}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
            </View>

            {/* Contact Information & Privacy */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact & Claim Information</Text>
              <View style={styles.contactCard}>
                <View style={styles.contactRow}>
                  <Icon name="user" size={16} color="#475569" />
                  <Text style={styles.contactText}>
                    {item.contactInfo?.name || item.user?.name || 'Campus Student'}
                  </Text>
                </View>

                {item.contactInfo?.email ? (
                  <View style={styles.contactRow}>
                    <Icon name="mail" size={16} color="#475569" />
                    <Text style={styles.contactText}>{item.contactInfo.email}</Text>
                  </View>
                ) : (
                  <View style={styles.contactRow}>
                    <Icon name="shield" size={16} color="#94A3B8" />
                    <Text style={styles.protectedText}>Email hidden by reporter</Text>
                  </View>
                )}

                {item.contactInfo?.phone ? (
                  <View style={styles.contactRow}>
                    <Icon name="phone" size={16} color="#475569" />
                    <Text style={styles.contactText}>{item.contactInfo.phone}</Text>
                  </View>
                ) : (
                  <View style={styles.contactRow}>
                    <Icon name="shield" size={16} color="#94A3B8" />
                    <Text style={styles.protectedText}>Phone hidden by reporter</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Owner Management Controls */}
            {canManage && (
              <View style={styles.ownerControls}>
                <Text style={styles.sectionTitle}>Manage Status</Text>
                <View style={styles.statusButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusOptionBtn,
                      item.status === 'OPEN' && styles.statusActiveOpen,
                    ]}
                    onPress={() => handleUpdateStatus('OPEN')}
                    disabled={loading}
                  >
                    <Text style={styles.statusOptionText}>Open</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusOptionBtn,
                      item.status === 'CLAIMED' && styles.statusActiveClaimed,
                    ]}
                    onPress={() => handleUpdateStatus('CLAIMED')}
                    disabled={loading}
                  >
                    <Text style={styles.statusOptionText}>Claimed</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusOptionBtn,
                      item.status === 'RESOLVED' && styles.statusActiveResolved,
                    ]}
                    onPress={() => handleUpdateStatus('RESOLVED')}
                    disabled={loading}
                  >
                    <Text style={styles.statusOptionText}>Resolved</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Student Claim Button */}
            {!canManage && item.status === 'OPEN' && (
              <View style={styles.claimSection}>
                {claimSuccess ? (
                  <View style={styles.successBox}>
                    <Icon name="check-circle" size={20} color="#16A36A" />
                    <Text style={styles.successText}>
                      Claim request submitted! Please reach out using the contact details above.
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.claimBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      setClaimSuccess(true);
                      Alert.alert(
                        'Claim Initiated',
                        `Please verify item ownership with ${
                          item.contactInfo?.name || 'the reporter'
                        }. Provide identifying details.`
                      );
                    }}
                  >
                    <Icon name="check" size={18} color="#FFFFFF" />
                    <Text style={styles.claimBtnText}>
                      {isLost ? 'Found this item? Contact Owner' : 'Claim this Item'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
    maxHeight: '90%',
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
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
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
    paddingBottom: 30,
  },
  imageBox: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    color: '#FBBF24',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  contactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  protectedText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  ownerControls: {
    marginTop: 8,
    marginBottom: 18,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  statusActiveOpen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A36A',
  },
  statusActiveClaimed: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  statusActiveResolved: {
    backgroundColor: '#E0E7FF',
    borderColor: '#6366F1',
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  claimSection: {
    marginTop: 10,
  },
  claimBtn: {
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
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
});
