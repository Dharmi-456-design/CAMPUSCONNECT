import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const POSTS = [
  {
    id: '1',
    author: 'Aryan Sharma',
    avatarText: 'AS',
    department: 'CS Semester 5',
    time: '2h ago',
    title: 'SIH Hackathon 2026: Looking for 1 Frontend React Native Dev',
    description: 'We have 4 members ready with Backend & ML models. Need an energetic developer for React Native mobile UI.',
    tags: ['Hackathon', 'React Native', 'Team'],
    upvotes: 24,
    comments: 8,
    upvoted: false,
  },
  {
    id: '2',
    author: 'Priya Patel',
    avatarText: 'PP',
    department: 'Information Technology',
    time: '5h ago',
    title: 'Best resources / YouTube playlist for Operating Systems algorithms?',
    description: 'Preparing for mid-sem exam on Process Scheduling & Deadlocks. Looking for clear notes or video series.',
    tags: ['Academics', 'OS', 'Exam'],
    upvotes: 42,
    comments: 15,
    upvoted: false,
  },
];

const LOST_FOUND = [
  {
    id: '101',
    type: 'LOST',
    item: 'Blue Boat Earbuds with Case',
    location: 'Near Central Library Reading Hall',
    date: 'Yesterday, 4:00 PM',
    status: 'Open',
    contact: 'Student Helpdesk',
  },
  {
    id: '102',
    type: 'FOUND',
    item: 'Scientific Calculator Casio fx-991EX',
    location: 'CS Lab 2, Table 14',
    date: 'Today, 11:30 AM',
    status: 'Available at Lab Incharge',
    contact: 'Lab Assistant',
  },
];

export default function CommunityScreen() {
  const [activeSection, setActiveSection] = useState('forum');
  const [search, setSearch] = useState('');
  const [postList, setPostList] = useState(POSTS);

  const toggleUpvote = (id) => {
    setPostList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newUpvoted = !p.upvoted;
          return {
            ...p,
            upvoted: newUpvoted,
            upvotes: newUpvoted ? p.upvotes + 1 : p.upvotes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleNewPost = () => {
    Alert.alert(
      'New Community Post',
      'Community discussion creation modal will connect to backend API in Day 5.',
      [{ text: 'Got it' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Campus Community</Text>
          <Text style={styles.headerSubtitle}>Discussions, Study Squads & Lost/Found</Text>
        </View>
        <TouchableOpacity style={styles.newPostBtn} onPress={handleNewPost} activeOpacity={0.8}>
          <Text style={styles.newPostBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions, teams or lost items..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Segment Selector */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSection === 'forum' && styles.segmentBtnActive]}
          onPress={() => setActiveSection('forum')}
        >
          <Text style={[styles.segmentText, activeSection === 'forum' && styles.segmentTextActive]}>
            💬 Discussions ({postList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSection === 'lostfound' && styles.segmentBtnActive]}
          onPress={() => setActiveSection('lostfound')}
        >
          <Text style={[styles.segmentText, activeSection === 'lostfound' && styles.segmentTextActive]}>
            🔍 Lost & Found ({LOST_FOUND.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeSection === 'forum' ? (
        <View style={styles.list}>
          {postList.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.authorRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.avatarText}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.authorDept}>{post.department} · {post.time}</Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDesc}>{post.description}</Text>

              <View style={styles.tagRow}>
                {post.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={[styles.footerAction, post.upvoted && styles.actionActive]}
                  onPress={() => toggleUpvote(post.id)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 14 }}>{post.upvoted ? '▲' : '△'}</Text>
                  <Text style={[styles.actionText, post.upvoted && { color: '#16A36A', fontWeight: '800' }]}>
                    {post.upvotes} Upvotes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerAction}
                  onPress={() => Alert.alert('Discussion Comments', `Opening ${post.comments} student replies.`)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 14 }}>💬</Text>
                  <Text style={styles.actionText}>{post.comments} Comments</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.list}>
          {LOST_FOUND.map((item) => (
            <View key={item.id} style={styles.postCard}>
              <View style={styles.lfHeader}>
                <View style={[styles.lfBadge, item.type === 'LOST' ? styles.badgeLost : styles.badgeFound]}>
                  <Text style={[styles.lfBadgeText, item.type === 'LOST' ? { color: '#DC2626' } : { color: '#16A36A' }]}>
                    {item.type}
                  </Text>
                </View>
                <Text style={styles.lfDate}>{item.date}</Text>
              </View>

              <Text style={styles.postTitle}>{item.item}</Text>
              <Text style={styles.lfDetail}>📍 Location: {item.location}</Text>
              <Text style={styles.lfDetail}>📞 Status: {item.status}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172B4D',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  newPostBtn: {
    backgroundColor: '#16A36A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newPostBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#172B4D',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#172B4D',
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#16A36A',
    fontWeight: '700',
    fontSize: 14,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172B4D',
  },
  authorDept: {
    fontSize: 12,
    color: '#64748B',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172B4D',
    lineHeight: 22,
    marginBottom: 6,
  },
  postDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 20,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionActive: {
    backgroundColor: '#E8F5EE',
  },
  actionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  lfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lfBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeLost: {
    backgroundColor: '#FEE2E2',
  },
  badgeFound: {
    backgroundColor: '#DCFCE7',
  },
  lfBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  lfDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  lfDetail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
