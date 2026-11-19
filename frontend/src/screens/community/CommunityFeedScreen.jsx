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
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import Icon from '../../components/common/Icon';
import CommunityPostCard from './CommunityPostCard';
import CreatePostModal from './CreatePostModal';
import PostDetailsModal from './PostDetailsModal';
import { getPostsApi } from '../../api/community.api';

const CATEGORIES = [
  'All',
  'Question',
  'Discussion',
  'Study Group',
  'Hackathon Squad',
  'General',
];

// Starter posts for instant 0ms screen render
const STARTER_POSTS = [
  {
    _id: 'post_1',
    title: 'Best resources for Machine Learning exam preparation?',
    content: 'Hey everyone, our ML exam is coming up. What resources are you using? I found Andrew Ng\'s course helpful but need more practice problems.',
    category: 'Question',
    author: { name: 'Ravi Sharma', _id: 'u1' },
    likes: 12,
    commentsCount: 5,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'post_2',
    title: 'Study group for DevOps & Cloud final week',
    content: 'Forming a study group for DevOps + Cloud Native exam. We\'ll meet in Library Block C at 4PM daily this week. All are welcome!',
    category: 'Study Group',
    author: { name: 'Priya Mehta', _id: 'u2' },
    likes: 8,
    commentsCount: 3,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'post_3',
    title: 'Hackathon Squad needed for Smart India Hackathon',
    content: 'Looking for 2 more members for SIH 2026 team. Need: 1 frontend dev (React Native) and 1 AI/ML enthusiast. DM me.',
    category: 'Hackathon Squad',
    author: { name: 'Aryan Patel', _id: 'u3' },
    likes: 15,
    commentsCount: 7,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CommunityFeedScreen({ onNavigateTab }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [posts, setPosts] = useState(STARTER_POSTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState('ALL'); // 'ALL' | 'MY'

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getPostsApi(params);
      let list = res.data?.posts || [];

      if (tabFilter === 'MY' && user) {
        list = list.filter((p) => {
          const authorId = p.author?._id || p.author;
          return authorId === user._id;
        });
      }

      if (list.length > 0) setPosts(list);
    } catch (err) {
      // Keep starter data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryFilter, search, tabFilter, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handlePostCreated = (newPost) => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }]}>
      {/* Header Bar */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.subTitle}>Student Forum</Text>
            <Text style={[styles.title, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Community & Doubts
            </Text>
          </View>
          <TouchableOpacity
            style={styles.askBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.askBtnText}>Ask Question</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
          <Icon name="search" size={16} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#F8FAFC' : '#0F172A' }]}
            placeholder="Search questions, discussions, subjects..."
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

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                categoryFilter === cat && styles.categoryChipActive,
                { borderColor: isDark ? '#334155' : '#E2E8F0' },
              ]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  categoryFilter === cat && styles.categoryChipTextActive,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Segment Tabs: All Posts vs My Questions */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              tabFilter === 'ALL' && styles.tabBtnActive,
            ]}
            onPress={() => setTabFilter('ALL')}
          >
            <Text
              style={[
                styles.tabBtnText,
                tabFilter === 'ALL' && styles.tabBtnTextActive,
              ]}
            >
              All Discussions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              tabFilter === 'MY' && styles.tabBtnActive,
            ]}
            onPress={() => setTabFilter('MY')}
          >
            <Text
              style={[
                styles.tabBtnText,
                tabFilter === 'MY' && styles.tabBtnTextActive,
              ]}
            >
              My Posts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed Content */}
      <View style={styles.feedBody}>
        {loading && !refreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#16A36A" />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Loading discussions...
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CommunityPostCard
                post={item}
                currentUserId={user?._id}
                isAdmin={user?.role === 'admin'}
                isDark={isDark}
                theme={theme}
                onPress={() => setSelectedPostId(item._id)}
                onDelete={handlePostDeleted}
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
              <View style={styles.emptyBox}>
                <Icon name="message-square" size={36} color="#94A3B8" />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No Discussions Found
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  {tabFilter === 'MY'
                    ? "You haven't posted any questions yet."
                    : 'Be the first to ask a question or start a discussion!'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyAskBtn}
                  onPress={() => setCreateModalVisible(true)}
                >
                  <Icon name="plus" size={16} color="#FFFFFF" />
                  <Text style={styles.emptyAskBtnText}>Ask Question</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createModalVisible}
        currentUser={user}
        onClose={() => setCreateModalVisible(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Post Details & Comments Modal */}
      <PostDetailsModal
        visible={Boolean(selectedPostId)}
        postId={selectedPostId}
        currentUser={user}
        onClose={() => setSelectedPostId(null)}
        onPostDeleted={handlePostDeleted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A36A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  askBtn: {
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  askBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#16A36A',
    borderColor: '#16A36A',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  feedBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
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
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A36A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyAskBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
