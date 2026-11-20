import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';

export default function CommunityPostCard({
  post,
  currentUserId,
  isAdmin,
  onPress,
  onDelete,
  isDark: propIsDark,
  theme: propTheme,
}) {
  const { isDark: contextIsDark, theme: contextTheme } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const theme = propTheme || contextTheme;
  const isAuthor =
    currentUserId &&
    post.author &&
    (post.author._id ? post.author._id === currentUserId : post.author === currentUserId);
  const canDelete = isAuthor || isAdmin;

  const authorName = post.author?.name || 'Campus Student';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorBranch = post.author?.branch || post.author?.role || 'Student';

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  const isSolved = post.status === 'solved';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isDark ? '#334155' : '#E2E8F0',
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Header Row: Author + Subject / Category + Delete */}
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
          <View style={[styles.avatar, { backgroundColor: '#16A36A' }]}>
            <Text style={styles.avatarText}>{authorInitial}</Text>
          </View>
          <View>
            <Text
              style={[
                styles.authorName,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}
            >
              {authorName}
            </Text>
            <Text style={styles.authorMeta}>
              {authorBranch} • {dateStr}
            </Text>
          </View>
        </View>

        {canDelete && onDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(post._id);
            }}
          >
            <Icon name="trash-2" size={15} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subject / Category Badges */}
      <View style={styles.tagsRow}>
        {post.subject ? (
          <View style={styles.subjectBadge}>
            <Icon name="book" size={11} color="#16A36A" />
            <Text style={styles.subjectText} numberOfLines={1}>
              {post.subject}
            </Text>
          </View>
        ) : null}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>

        {post.helpType === 'tutor' && (
          <View style={styles.tutorBadge}>
            <Icon name="award" size={11} color="#3B82F6" />
            <Text style={styles.tutorBadgeText}>Ask Tutor</Text>
          </View>
        )}

        {isSolved && (
          <View style={styles.solvedBadge}>
            <Icon name="check-circle" size={11} color="#16A36A" />
            <Text style={styles.solvedText}>Solved</Text>
          </View>
        )}
      </View>

      {/* Post Title */}
      <Text
        style={[
          styles.title,
          { color: isDark ? '#F8FAFC' : '#0F172A' },
        ]}
        numberOfLines={2}
      >
        {post.title}
      </Text>

      {/* Post Content Snippet */}
      <Text
        style={[
          styles.content,
          { color: isDark ? '#94A3B8' : '#475569' },
        ]}
        numberOfLines={2}
      >
        {post.content}
      </Text>

      {/* Footer Stats Row: Upvotes & Comments */}
      <View style={styles.footerRow}>
        <View style={styles.statsLeft}>
          <View style={styles.statItem}>
            <Icon name="message-square" size={14} color="#64748B" />
            <Text style={styles.statText}>
              {post.commentCount || 0} {post.commentCount === 1 ? 'answer' : 'answers'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="thumbs-up" size={14} color="#64748B" />
            <Text style={styles.statText}>{post.upvoteCount || 0} votes</Text>
          </View>
        </View>

        <View style={styles.viewDiscussion}>
          <Text style={styles.viewDiscussionText}>View Discussion</Text>
          <Icon name="chevron-right" size={14} color="#16A36A" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    maxWidth: 200,
  },
  subjectText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  tutorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  tutorBadgeText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  solvedText: {
    color: '#16A36A',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  content: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  viewDiscussion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDiscussionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A36A',
  },
});
