import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from '../../components/common/Icon';
import { getPostByIdApi, addCommentApi, deletePostApi } from '../../api/community.api';

export default function PostDetailsModal({
  visible,
  postId,
  currentUser,
  onClose,
  onPostDeleted,
}) {
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New comment
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPostDetails = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const res = await getPostByIdApi(postId);
      setPostData(res.data?.post || null);
      setComments(res.data?.comments || []);
    } catch (err) {
      console.error('Failed to load post details:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible && postId) {
      fetchPostDetails();
    }
  }, [visible, postId, fetchPostDetails]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await addCommentApi(postId, { content: commentText.trim() });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to remove this post and all its answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostApi(postId);
              Alert.alert('Deleted', 'Post removed successfully');
              if (onPostDeleted) onPostDeleted(postId);
              onClose();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  if (!visible) return null;

  const isAuthor =
    currentUser &&
    postData?.author &&
    (postData.author._id ? postData.author._id === currentUser._id : postData.author === currentUser._id);
  const canDelete = isAuthor || currentUser?.role === 'admin';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="x" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.sheetHeaderTitle}>Discussion</Text>
            {canDelete ? (
              <TouchableOpacity onPress={handleDeletePost} style={styles.deleteBtn}>
                <Icon name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
          </View>

          {loading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#16A36A" />
            </View>
          ) : postData ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
            >
              {/* Author Row */}
              <View style={styles.authorRow}>
                <View style={[styles.avatar, { backgroundColor: '#16A36A' }]}>
                  <Text style={styles.avatarText}>
                    {postData.author?.name?.charAt(0).toUpperCase() || 'S'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.authorName}>
                    {postData.author?.name || 'Campus Student'}
                  </Text>
                  <Text style={styles.authorMeta}>
                    {postData.author?.branch || postData.author?.role || 'Student'} •{' '}
                    {new Date(postData.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {/* Subject & Category Pills */}
              <View style={styles.badgesRow}>
                {postData.subject ? (
                  <View style={styles.subjectBadge}>
                    <Icon name="book" size={12} color="#166534" />
                    <Text style={styles.subjectText}>{postData.subject}</Text>
                  </View>
                ) : null}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{postData.category}</Text>
                </View>
                {postData.status === 'solved' && (
                  <View style={styles.solvedBadge}>
                    <Icon name="check-circle" size={12} color="#16A36A" />
                    <Text style={styles.solvedText}>Solved</Text>
                  </View>
                )}
              </View>

              {/* Title & Body */}
              <Text style={styles.postTitle}>{postData.title}</Text>
              <Text style={styles.postContent}>{postData.content}</Text>

              <View style={styles.divider} />

              {/* Comments Section */}
              <View style={styles.commentsHeader}>
                <Icon name="message-square" size={16} color="#0F172A" />
                <Text style={styles.commentsTitle}>
                  Answers & Discussion ({comments.length})
                </Text>
              </View>

              {comments.length === 0 ? (
                <View style={styles.noCommentsBox}>
                  <Text style={styles.noCommentsText}>
                    No answers yet. Be the first peer or faculty to help out!
                  </Text>
                </View>
              ) : (
                comments.map((c) => (
                  <View key={c._id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthorRow}>
                        <View style={styles.smallAvatar}>
                          <Text style={styles.smallAvatarText}>
                            {c.author?.name?.charAt(0).toUpperCase() || 'P'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.commentAuthorName}>
                            {c.author?.name || 'Peer'}
                          </Text>
                          <Text style={styles.commentAuthorRole}>
                            {c.author?.role === 'faculty' ? 'Faculty Mentor' : 'Student TA'}
                          </Text>
                        </View>
                      </View>
                      {c.isSolution && (
                        <View style={styles.solutionPill}>
                          <Icon name="check" size={11} color="#16A36A" />
                          <Text style={styles.solutionText}>Solution</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.commentBody}>{c.content}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          ) : (
            <View style={styles.centerLoading}>
              <Text>Post not found</Text>
            </View>
          )}

          {/* Bottom Add Comment Bar */}
          <View style={styles.commentInputBar}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your answer or explanation..."
              placeholderTextColor="#94A3B8"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendCommentBtn,
                !commentText.trim() && styles.sendCommentBtnDisabled,
              ]}
              onPress={handleAddComment}
              disabled={submittingComment || !commentText.trim()}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    minHeight: '70%',
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
  centerLoading: {
    padding: 50,
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  authorMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  subjectText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  solvedText: {
    color: '#16A36A',
    fontSize: 11,
    fontWeight: '700',
  },
  postTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  noCommentsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  noCommentsText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  commentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  commentAuthorRole: {
    fontSize: 10,
    color: '#64748B',
  },
  solutionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  solutionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  commentBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 90,
  },
  sendCommentBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
});
