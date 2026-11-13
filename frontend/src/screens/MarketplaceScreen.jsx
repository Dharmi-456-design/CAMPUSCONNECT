import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';

const STATS = [
  { label: 'Active Listings', value: '48+', sub: 'Verified peer items', icon: 'shopping-bag', color: '#16A36A', bg: 'rgba(201,168,76,0.15)' },
  { label: 'Campus Buyers', value: '120+', sub: 'Active students', icon: 'users', color: '#22D3EE', bg: 'rgba(6,182,212,0.15)' },
  { label: 'Verified Sellers', value: '100%', sub: 'University ID check', icon: 'shield', color: '#34D399', bg: 'rgba(16,185,129,0.15)' },
  { label: 'Satisfaction', value: '4.9 ★', sub: 'Peer rating', icon: 'star', color: '#FBBF24', bg: 'rgba(245,158,11,0.15)' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: 'grid' },
  { id: 'books', label: 'Books & Notes', icon: 'book-open' },
  { id: 'electronics', label: 'Electronics', icon: 'monitor' },
  { id: 'lab', label: 'Lab Gear', icon: 'test-tube' },
  { id: 'calculators', label: 'Calculators', icon: 'cpu' },
  { id: 'stationery', label: 'Stationery', icon: 'edit-3' },
  { id: 'hostel', label: 'Hostel Gear', icon: 'home' },
];

const POPULAR_CATS = [
  { name: 'Books & Notes', icon: 'book-open', count: '12 Items' },
  { name: 'Calculators', icon: 'cpu', count: '08 Items' },
  { name: 'Lab Gear & Coats', icon: 'test-tube', count: '06 Items' },
  { name: 'Electronics & Gadgets', icon: 'monitor', count: '05 Items' },
  { name: 'Hostel Essentials', icon: 'home', count: '04 Items' },
];

const INITIAL_ITEMS = [
  {
    id: 'item-1',
    title: 'Engineering Mathematics B.S. Grewal (44th Edition)',
    category: 'Books & Notes',
    catKey: 'books',
    icon: 'book-open',
    condition: 'LIKE NEW',
    price: 380,
    originalPrice: 750,
    faculty: 'Faculty of Engineering (SSIT)',
    description: 'Complete syllabus coverage. No missing pages or ink marks. Includes solved question papers from previous 5 semesters.',
    seller: {
      name: 'Harsh Shah',
      branch: 'SSIT Computer Engg. • Sem 5',
      rating: '4.9 ★ (12 reviews)',
      initial: 'H',
      avatarBg: '#16A36A',
    },
  },
  {
    id: 'item-2',
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    category: 'Calculators',
    catKey: 'calculators',
    icon: 'cpu',
    condition: 'EXCELLENT',
    price: 650,
    originalPrice: 1350,
    faculty: 'Faculty of Engineering (SSIT)',
    description: '552 functions, dual solar + battery. Perfect for engineering mathematics & mechanics calculations. Original box included.',
    seller: {
      name: 'Rahul Mehta',
      branch: 'SSIT Mechanical • Sem 5',
      rating: '4.8 ★ (8 reviews)',
      initial: 'R',
      avatarBg: '#06B6D4',
    },
  },
  {
    id: 'item-3',
    title: 'Sterile Pharmacy Lab Coat & Borosilicate Kit',
    category: 'Lab Gear',
    catKey: 'lab',
    icon: 'test-tube',
    condition: 'LIKE NEW',
    price: 450,
    originalPrice: 900,
    faculty: 'Faculty of Pharmacy',
    description: 'Size M sanitized lab coat with set of 4 measuring cylinders & beakers. Ready for practicals in pharmaceutical analysis.',
    seller: {
      name: 'Ananya Sharma',
      branch: 'B.Pharm • Sem 3',
      rating: '5.0 ★ (15 reviews)',
      initial: 'A',
      avatarBg: '#10B981',
    },
  },
];

export default function MarketplaceScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedItemForContact, setSelectedItemForContact] = useState(null);
  const [contactMessage, setContactMessage] = useState('');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCondition, setFormCondition] = useState('LIKE NEW');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSellSubmit = () => {
    if (!formTitle.trim() || !formPrice.trim()) {
      if (Platform.OS === 'web') window.alert('Please provide at least a title and price.');
      else Alert.alert('Incomplete', 'Please provide at least a title and price.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newItem = {
        id: `item-${Date.now()}`,
        title: formTitle,
        category: formCategory || 'Books & Notes',
        catKey: 'books',
        icon: 'book-open',
        condition: formCondition,
        price: Number(formPrice) || 300,
        originalPrice: (Number(formPrice) || 300) * 1.8,
        faculty: 'Faculty of Engineering (SSIT)',
        description: formDesc || 'Listed by peer student on Campus Marketplace.',
        seller: {
          name: user?.name || 'Dharmi Patel',
          branch: `${user?.branch || 'Computer Engg.'} • Sem ${user?.semester || 3}`,
          rating: '5.0 ★ (New)',
          initial: (user?.name || 'D').charAt(0).toUpperCase(),
          avatarBg: '#16A36A',
        },
      };

      setItems([newItem, ...items]);
      setSellModalVisible(false);
      setFormTitle('');
      setFormPrice('');
      setFormDesc('');
      setSubmitting(false);

      if (Platform.OS === 'web') window.alert('Item successfully listed! 🛍️');
      else Alert.alert('Success 🎉', 'Item successfully listed!');
    }, 400);
  };

  const handleOpenContact = (item) => {
    setSelectedItemForContact(item);
    setContactMessage(`Hi ${item.seller.name}, I'm interested in "${item.title}". Is it still available on campus?`);
    setContactModalVisible(true);
  };

  const handleSendContactMessage = () => {
    setContactModalVisible(false);
    if (Platform.OS === 'web') {
      window.alert(`Inquiry sent to ${selectedItemForContact?.seller.name}! You can chat directly via Study Rooms.`);
    } else {
      Alert.alert('Message Sent 🎉', `Inquiry sent to ${selectedItemForContact?.seller.name}!`);
    }
  };

  const filteredItems = items.filter((it) => {
    const matchCat = selectedCat === 'all' || it.catKey === selectedCat;
    const matchSearch =
      !searchQuery ||
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const bgCard = theme.bgCard;
  const border = theme.border;
  const textTitle = theme.textPrimary;
  const textSub = theme.textMuted;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 1. HEADER ROW WITH SELL BUTTON ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[styles.pageTitle, { color: textTitle }]}>Campus Marketplace 🛍️</Text>
          <Text style={[styles.pageSub, { color: textSub }]}>
            Buy & sell verified textbooks, lab coats, calculators and essentials with your peers
          </Text>
        </View>

        <TouchableOpacity style={styles.postSellBtn} onPress={() => setSellModalVisible(true)} activeOpacity={0.85}>
          <Icon name="plus" size={14} color="#0c0f10" style={{ marginRight: 6 }} />
          <Text style={styles.postSellBtnText}>+ Sell Item</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. CLEAN STATS CARDS ── */}
      <View style={styles.statsGrid}>
        {STATS.map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: bgCard, borderColor: border }]}>
            <View style={styles.statTopRow}>
              <Text style={[styles.statLabel, { color: textSub }]}>{s.label}</Text>
              <View style={[styles.statIconCircle, { backgroundColor: s.bg }]}>
                <Icon name={s.icon} size={15} color={s.color} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: textTitle }]}>{s.value}</Text>
            <Text style={[styles.statSub, { color: textSub }]}>{s.sub}</Text>
          </View>
        ))}
      </View>

      {/* ── 3. SEARCH & CATEGORY FILTER BAR ── */}
      <View style={[styles.filtersBox, { backgroundColor: bgCard, borderColor: border }]}>
        <View style={[styles.searchWrap, { backgroundColor: isDark ? '#121927' : '#F8FAFC', borderColor: border }]}>
          <Icon name="search" size={15} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: textTitle }]}
            placeholder="Search books, calculators, lab gear, notes..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Pills Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catPillsScroll}>
          {CATEGORIES.map((c) => {
            const isSel = selectedCat === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: isSel ? '#16A36A' : isDark ? '#121927' : '#F1F5F9',
                    borderColor: isSel ? '#16A36A' : border,
                  },
                ]}
                onPress={() => setSelectedCat(c.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catPillText, { color: isSel ? '#0c0f10' : textSub, fontWeight: isSel ? '700' : '600' }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 4. TWO-COLUMN SPLIT: Items Feed + Right Widgets ── */}
      <View style={[styles.splitGrid, isDesktop && styles.splitGridRow]}>
        {/* LEFT COLUMN: Clean Responsive Item Cards */}
        <View style={styles.leftCol}>
          {filteredItems.map((item) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: bgCard, borderColor: border }]}>
              {/* Card Header: Category Icon + Badges + Price */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.categoryIconBox, { backgroundColor: isDark ? 'rgba(201,168,76,0.16)' : '#E8F5EE' }]}>
                    <Icon name={item.icon || 'tag'} size={18} color={isDark ? '#16A36A' : '#16A36A'} />
                  </View>
                  <View>
                    <View style={styles.badgesRow}>
                      <View style={[styles.badgePill, { backgroundColor: isDark ? 'rgba(201,168,76,0.15)' : '#E8F5EE' }]}>
                        <Text style={{ color: isDark ? '#16A36A' : '#16A36A', fontSize: 10.5, fontWeight: '700' }}>
                          {item.category.toUpperCase()}
                        </Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                        <Text style={{ color: '#34D399', fontSize: 10.5, fontWeight: '700' }}>{item.condition}</Text>
                      </View>
                    </View>
                    <Text style={[styles.itemFaculty, { color: textSub }]}>{item.faculty}</Text>
                  </View>
                </View>

                {/* Price Display */}
                <View style={styles.priceCol}>
                  <Text style={[styles.priceValue, { color: isDark ? '#16A36A' : '#16A36A' }]}>₹{item.price}</Text>
                  {item.originalPrice && (
                    <Text style={[styles.originalPriceText, { color: textSub }]}>MRP ₹{item.originalPrice}</Text>
                  )}
                </View>
              </View>

              {/* Title & Description */}
              <Text style={[styles.itemTitle, { color: textTitle }]}>{item.title}</Text>
              <Text style={[styles.itemDesc, { color: textSub }]}>{item.description}</Text>

              {/* Seller Row + Contact Action */}
              <View style={[styles.sellerRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                <View style={styles.sellerLeft}>
                  <View style={[styles.sellerAvatar, { backgroundColor: item.seller.avatarBg }]}>
                    <Text style={styles.avatarInitial}>{item.seller.initial}</Text>
                  </View>
                  <View>
                    <Text style={[styles.sellerName, { color: textTitle }]}>{item.seller.name}</Text>
                    <Text style={[styles.sellerBranch, { color: textSub }]}>{item.seller.branch}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.contactBtn} onPress={() => handleOpenContact(item)} activeOpacity={0.85}>
                  <Icon name="message-square" size={13} color="#0c0f10" style={{ marginRight: 6 }} />
                  <Text style={styles.contactBtnText}>Contact Seller →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* RIGHT COLUMN: Popular Categories & Safety Guidelines */}
        <View style={styles.rightCol}>
          {/* Popular Categories */}
          <View style={[styles.widgetCard, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={[styles.widgetTitle, { color: textTitle }]}>Popular Categories</Text>
            <View style={styles.catList}>
              {POPULAR_CATS.map((cat, idx) => (
                <TouchableOpacity key={idx} style={[styles.catRow, { borderBottomColor: border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name={cat.icon} size={15} color="#16A36A" style={{ marginRight: 8 }} />
                    <Text style={[styles.catName, { color: textTitle }]}>{cat.name}</Text>
                  </View>
                  <Text style={[styles.catCount, { color: textSub }]}>{cat.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Campus Handover Assurance */}
          <View style={[styles.widgetCard, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={[styles.widgetTitle, { color: textTitle }]}>Campus Handover Safety</Text>
            <View style={styles.trustBullets}>
              <View style={styles.bulletRow}>
                <Icon name="shield" size={16} color="#10B981" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bulletTitle, { color: textTitle }]}>100% Student Verified</Text>
                  <Text style={[styles.bulletSub, { color: textSub }]}>Transactions occur on-campus between verified peers.</Text>
                </View>
              </View>
              <View style={styles.bulletRow}>
                <Icon name="check-circle" size={16} color="#16A36A" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bulletTitle, { color: textTitle }]}>Zero Commission</Text>
                  <Text style={[styles.bulletSub, { color: textSub }]}>Keep 100% of your earnings with no middleman fees.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sell Prompt */}
          <View style={[styles.sellPromptCard, { backgroundColor: isDark ? 'rgba(201,168,76,0.12)' : '#E8F5EE', borderColor: '#16A36A' }]}>
            <Text style={[styles.sellPromptTitle, { color: textTitle }]}>Have books or gear to sell?</Text>
            <Text style={[styles.sellPromptSub, { color: textSub }]}>
              Help junior students save money while clearing out your old semester essentials.
            </Text>
            <TouchableOpacity style={styles.sellPromptBtn} onPress={() => setSellModalVisible(true)}>
              <Text style={styles.sellPromptBtnText}>+ Post New Listing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── SELL ITEM MODAL ── */}
      <Modal visible={sellModalVisible} transparent animationType="fade" onRequestClose={() => setSellModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textTitle }]}>List Item for Sale 🛍️</Text>
              <TouchableOpacity onPress={() => setSellModalVisible(false)}>
                <Icon name="x" size={18} color={textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: textSub }]}>Item Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                placeholder="e.g. Higher Engineering Mathematics B.S. Grewal"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: textSub }]}>Category</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                    placeholder="e.g. Books & Notes"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={formCategory}
                    onChangeText={setFormCategory}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: textSub }]}>Price (₹) *</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                    placeholder="380"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="numeric"
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: textSub }]}>Description & Condition</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle }]}
                multiline
                numberOfLines={3}
                placeholder="Specify edition, condition, or preferred campus handover spot..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={formDesc}
                onChangeText={setFormDesc}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: border }]} onPress={() => setSellModalVisible(false)}>
                  <Text style={{ color: textSub, fontWeight: '600', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleSellSubmit} disabled={submitting}>
                  {submitting ? <ActivityIndicator size="small" color="#0c0f10" /> : <Text style={styles.confirmBtnText}>Post Listing →</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── CONTACT SELLER MODAL ── */}
      <Modal visible={contactModalVisible} transparent animationType="fade" onRequestClose={() => setContactModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textTitle }]}>
                Contact {selectedItemForContact?.seller.name} 💬
              </Text>
              <TouchableOpacity onPress={() => setContactModalVisible(false)}>
                <Icon name="x" size={18} color={textSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: textSub }]}>Your Message</Text>
            <TextInput
              style={[styles.modalTextArea, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border, color: textTitle, minHeight: 85 }]}
              multiline
              value={contactMessage}
              onChangeText={setContactMessage}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: border }]} onPress={() => setContactModalVisible(false)}>
                <Text style={{ color: textSub, fontWeight: '600', fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSendContactMessage}>
                <Text style={styles.confirmBtnText}>Send Inquiry →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pageSub: {
    fontSize: 12.5,
    marginTop: 3,
    lineHeight: 18,
  },
  postSellBtn: {
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
  },
  postSellBtnText: {
    color: '#0c0f10',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 145,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  statIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statSub: {
    fontSize: 10.5,
    marginTop: 2,
  },

  /* Filters */
  filtersBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  catPillsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 11.5,
  },

  /* Layout */
  splitGrid: {
    flexDirection: 'column',
  },
  splitGridRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1.4,
    gap: 12,
  },
  rightCol: {
    flex: 1,
    gap: 14,
  },

  /* Item Card (Responsive) */
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 3,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  itemFaculty: {
    fontSize: 10.5,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  originalPriceText: {
    fontSize: 10.5,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  sellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#0c0f10',
    fontSize: 13,
    fontWeight: '800',
  },
  sellerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  sellerBranch: {
    fontSize: 10.5,
  },
  contactBtn: {
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  contactBtnText: {
    color: '#0c0f10',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Right Widgets */
  widgetCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  catList: {
    gap: 8,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
  },
  catCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  trustBullets: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  bulletSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  sellPromptCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sellPromptTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  sellPromptSub: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  sellPromptBtn: {
    backgroundColor: '#16A36A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  sellPromptBtnText: {
    color: '#0c0f10',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#16A36A',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#0c0f10',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
