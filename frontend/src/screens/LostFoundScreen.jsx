import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';
import LostFoundCard from './lostfound/LostFoundCard';
import LostFoundDetailsModal from './lostfound/LostFoundDetailsModal';
import AddLostFoundModal from './lostfound/AddLostFoundModal';
import { getLostFoundItemsApi } from '../api/lostFound.api';

const CATEGORIES = [
  'All',
  'Wallets & Bags',
  'Electronics',
  'Watches & Jewelry',
  'Books & Notes',
  'ID Cards',
  'Keys',
  'Other',
];

// Starter items for instant 0ms screen render
const STARTER_ITEMS = [
  {
    _id: 'lf_1',
    title: 'Casio FX-991ES Scientific Calculator',
    description: 'Black Casio scientific calculator found near Seminar Hall B. Has sticker on the back with initials "R.S."',
    type: 'FOUND',
    category: 'Electronics',
    location: 'Seminar Hall B, Block C',
    reportedBy: { name: 'Priya Mehta', _id: 'u1' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    _id: 'lf_2',
    title: 'Blue Water Bottle (Milton Brand)',
    description: 'Lost my blue Milton water bottle somewhere in the library or canteen area. Has name written in marker.',
    type: 'LOST',
    category: 'Other',
    location: 'Library / Canteen area',
    reportedBy: { name: 'Dharmi Patel', _id: 'u2' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    _id: 'lf_3',
    title: 'SSIT Student ID Card',
    description: 'Found a student ID card of Swaminarayan University near the main gate. Please contact to claim.',
    type: 'FOUND',
    category: 'ID Cards',
    location: 'Main Gate Security',
    reportedBy: { name: 'Ravi Sharma', _id: 'u3' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    _id: 'lf_4',
    title: 'Engineering Drawing Notebook (6th Sem)',
    description: 'Lost a thick engineering drawing notebook with blue cover. Has my name inside. Very important for my records.',
    type: 'LOST',
    category: 'Books & Notes',
    location: 'Drawing Hall, Ground Floor',
    reportedBy: { name: 'Ankit Desai', _id: 'u4' },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
];

export default function LostFoundScreen({ onBack }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [items, setItems] = useState(STARTER_ITEMS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, LOST, FOUND
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getLostFoundItemsApi(params);
      const fetched = res.data?.items || [];
      if (fetched.length > 0) setItems(fetched);
    } catch (err) {
      // Keep starter data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, categoryFilter, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleItemUpdated = (updatedItem, deletedId) => {
    if (deletedId) {
      setItems((prev) => prev.filter((i) => i._id !== deletedId));
    } else if (updatedItem) {
      setItems((prev) =>
        prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
      );
    }
  };

  const handleItemCreated = (newItem) => {
    if (newItem) {
      setItems((prev) => [newItem, ...prev]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }]}>
      {/* Top Bar matching Image 3 middle screen */}
      <View style={[styles.topBar, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        <View style={styles.topBarLeft}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.topIconBtn}>
              <Icon name="arrow-left" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          ) : (
            <View style={styles.topIconBtn}>
              <Icon name="grid" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </View>
          )}
          <Text style={[styles.screenHeading, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Lost & Found
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addReportBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addReportBtnText}>Report</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16A36A']}
            tintColor="#16A36A"
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Dark Hero Card matching Image 3 (Discover Lost Items) */}
        <View style={styles.bannerWrapper}>
          <View style={[styles.heroCard, { backgroundColor: '#1E293B' }]}>
            <Text style={styles.heroCardTitle}>Discover Lost Items</Text>
            <Text style={styles.heroCardSubtitle}>
              Find your lost items or help a fellow student claim theirs
            </Text>

            {/* Search Bar matching Image 3 */}
            <View style={styles.searchBar}>
              <Icon name="search" size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items, wallets, keys..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Icon name="x" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : (
                <Icon name="sliders" size={16} color="#94A3B8" />
              )}
            </View>
          </View>
        </View>

        {/* Item categories section matching Image 3 */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Item categories
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isActive
                    ? { backgroundColor: '#16A36A' }
                    : { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                ]}
                onPress={() => setCategoryFilter(cat)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive
                      ? { color: '#FFFFFF', fontWeight: '700' }
                      : { color: isDark ? '#CBD5E1' : '#475569' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Type Filter Tabs (All, Lost, Found) */}
        <View style={[styles.typeTabsRow, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
          <TouchableOpacity
            style={[
              styles.typeTab,
              typeFilter === 'ALL' && styles.typeTabActive,
            ]}
            onPress={() => setTypeFilter('ALL')}
          >
            <Text
              style={[
                styles.typeTabText,
                typeFilter === 'ALL' && styles.typeTabTextActive,
              ]}
            >
              All Items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              typeFilter === 'LOST' && styles.typeTabActiveLost,
            ]}
            onPress={() => setTypeFilter('LOST')}
          >
            <Text
              style={[
                styles.typeTabText,
                typeFilter === 'LOST' && { color: '#FFFFFF', fontWeight: '700' },
              ]}
            >
              Lost Only
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              typeFilter === 'FOUND' && styles.typeTabActiveFound,
            ]}
            onPress={() => setTypeFilter('FOUND')}
          >
            <Text
              style={[
                styles.typeTabText,
                typeFilter === 'FOUND' && { color: '#FFFFFF', fontWeight: '700' },
              ]}
            >
              Found Only
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Posts Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Recent posts
          </Text>
          <Text style={styles.countBadge}>{items.length} items</Text>
        </View>

        {/* 2-Column Grid Layout matching Image 3 */}
        {loading && !refreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#16A36A" />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Finding campus items...
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="search" size={32} color="#16A36A" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No items reported
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              {typeFilter === 'LOST'
                ? 'No lost items match your search.'
                : typeFilter === 'FOUND'
                ? 'No found items reported yet.'
                : 'Be the first to report a lost or found item.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyReportBtn}
              onPress={() => setAddModalVisible(true)}
            >
              <Icon name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.emptyReportBtnText}>Report An Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {items.map((item) => (
              <LostFoundCard
                key={item._id}
                item={item}
                onPress={() => setSelectedItem(item)}
                isDark={isDark}
                theme={theme}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Details Modal */}
      <LostFoundDetailsModal
        visible={Boolean(selectedItem)}
        item={selectedItem}
        currentUser={user}
        onClose={() => setSelectedItem(null)}
        onItemUpdated={handleItemUpdated}
      />

      {/* Add Report Modal */}
      <AddLostFoundModal
        visible={addModalVisible}
        currentUser={user}
        onClose={() => setAddModalVisible(false)}
        onItemCreated={handleItemCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: '800',
  },
  addReportBtn: {
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addReportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  bannerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroCardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 17,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  countBadge: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  typeTabActiveLost: {
    backgroundColor: '#EF4444',
  },
  typeTabActiveFound: {
    backgroundColor: '#16A36A',
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  centerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A36A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyReportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
