import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ContactsScreen({ onBack, onSelectContact }) {
  const { theme: C } = useTheme();

  const [contacts, setContacts] = useState([
    { id: '1', name: 'Aarav Sharma', role: 'Head TA — Data Structures', branch: 'Computer Science', phone: '+91 98765 43210', email: 'aarav@college.edu' },
    { id: '2', name: 'Sneha Rao', role: 'President — Coding Club', branch: 'Information Tech', phone: '+91 98234 56789', email: 'sneha@college.edu' },
    { id: '3', name: 'Dr. K. Raman', role: 'Faculty Mentor — AI & ML', branch: 'Computer Science', phone: '+91 91234 56780', email: 'raman.k@college.edu' },
    { id: '4', name: 'Pooja Iyer', role: 'Campus Ambassador Lead', branch: 'Electronics & Comm', phone: '+91 99887 76655', email: 'pooja@college.edu' },
    { id: '5', name: 'Vikram Singh', role: 'Hackathon Squad Lead', branch: 'Mechanical & Auto', phone: '+91 98711 22334', email: 'vikram@college.edu' }
  ]);

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.branch.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number.');
      return;
    }
    const newEntry = {
      id: Math.random().toString(),
      name: newName,
      role: newRole || 'Student Peer',
      branch: 'Computer Science',
      phone: newPhone,
      email: newEmail || 'peer@college.edu'
    };
    setContacts([newEntry, ...contacts]);
    setNewName('');
    setNewRole('');
    setNewPhone('');
    setNewEmail('');
    setModalVisible(false);
    Alert.alert('Contact Added 🎉', `${newName} added to directory.`);
  };

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: C.navBg, borderBottomColor: C.border }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="arrow-left" size={18} color={C.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>👥 Campus Directory & Contacts</Text>
          <Text style={[styles.headerSub, { color: C.textMuted }]}>TAs, faculty mentors & student leads</Text>
        </View>
        <Button
          title="Add Contact"
          size="sm"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: C.bgInput, borderColor: C.border }]}>
          <Icon name="search" size={16} color={C.textDim} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: C.textPrimary }]}
            placeholder="Search by name, TA role, or department..."
            placeholderTextColor={C.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Contacts List */}
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <GlassCard topAccent={C.emerald} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.avatarBox, { backgroundColor: C.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: C.primary }]}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactName, { color: C.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.contactRole, { color: C.primary }]}>{item.role}</Text>
                  <Text style={[styles.contactBranch, { color: C.textMuted }]}>{item.branch}</Text>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: C.divider }]}>
                <Text style={[styles.metaText, { color: C.textDim }]}>📞 {item.phone}</Text>
                <Text style={[styles.metaText, { color: C.textDim }]}>✉️ {item.email}</Text>
              </View>
            </GlassCard>
          )}
        />
      </View>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <View style={[styles.modalCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.textPrimary }]}>Add Campus Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.75}>
                <Icon name="x" size={20} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input label="Full Name *" placeholder="e.g. Rahul Sharma" value={newName} onChangeText={setNewName} />
              <Input label="Role / Title" placeholder="e.g. TA for ADA / President — Hack Club" value={newRole} onChangeText={setNewRole} />
              <Input label="Phone Number *" placeholder="+91 98765 43210" keyboardType="phone-pad" value={newPhone} onChangeText={setNewPhone} />
              <Input label="College Email" placeholder="rahul@college.edu" keyboardType="email-address" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" />
              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Add to Directory" onPress={handleAddContact} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  content: { flex: 1, padding: 16, paddingBottom: 0 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14
  },
  searchInput: { flex: 1, fontSize: 13 },
  list: { paddingBottom: 80 },
  card: { marginBottom: 12, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700' },
  contactName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  contactRole: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  contactBranch: { fontSize: 11 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 8 },
  metaText: { fontSize: 11 },
  modalBg: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalActions: { flexDirection: 'row', marginTop: 8, marginBottom: 20 }
});
