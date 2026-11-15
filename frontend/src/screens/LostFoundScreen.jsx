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

export default function LostFoundScreen({ onBack }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const params = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getLostFoundItemsApi(params);
      setItems(res.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch lost found items:', err);
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
      {/* Top Hero Dark Banner matching screenshot */}
      <View style={[styles.heroBanner, { backgroundColor: isDark ? '#0F172A' : '#1E293B' }]}>
        <View style={styles.headerTopRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Icon name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerSubtitle}>Campus Directory</Text>
            <Text style={styles.bannerTitle}>Discover Lost Items</Text>
          </View>
          <TouchableOpacity
            style={styles.addReportBtn}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.85}
          >
            <Icon name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addReportBtnText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items, wallets, electronics..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                categoryFilter === cat && styles.categoryPillActive,
              ]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  categoryFilter === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Body */}
      <View style={styles.body}>
        {/* Type Toggle Tabs: All / Lost / Found */}
        <View style={styles.typeTabsRow}>
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
                typeFilter === 'LOST' && styles.typeTabTextActive,
              ]}
            >
              Lost Items
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
                typeFilter === 'FOUND' && styles.typeTabTextActive,
              ]}
            >
              Found Items
            </Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        {loading && !refreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#16A36A" />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Finding campus reports...
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <LostFoundCard
                item={item}
                isDark={isDark}
                theme={theme}
                onPress={() => setSelectedItem(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#16A36A']}
                tintColor="#16A36A"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="inbox" size={36} color="#94A3B8" />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No Items Reported Yet
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  {typeFilter === 'LOST'
                    ? 'No lost items match your search. Everything seems safe!'
                    : typeFilter === 'FOUND'
                    ? 'No found items reported in this category yet.'
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
            }
          />
        )}
      </View>

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
  heroBanner: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoryPillActive: {
    backgroundColor: '#16A36A',
  },
  categoryPillText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  typeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
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
  listContent: {
    paddingBottom: 30,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
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
