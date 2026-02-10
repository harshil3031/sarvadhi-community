import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Post } from '../src/api/posts';
import { postApi } from '../src/api/posts';
import { reactionApi, Reaction } from '../src/api/reaction.api';
import ReactionBar from './ReactionBar';
import CommentList from './CommentList';

interface PostCardProps {
  post: Post.Post;
  currentUserId?: string;
  onPostUpdated?: (updatedPost: Post.Post) => void;
  onPostDeleted?: (postId: string) => void;
  showActions?: boolean;
}

export default function PostCard({
  post,
  currentUserId,
  onPostUpdated,
  onPostDeleted,
  showActions = true,
}: PostCardProps) {
  const router = useRouter();
  const [isPinning, setIsPinning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [reactionSummary, setReactionSummary] = useState<Reaction.ReactionSummary[]>([]);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);

  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactions, setReactions] = useState<Reaction.Reaction[]>([]);
  const [loadingReactionsModal, setLoadingReactionsModal] = useState(false);

  const isAuthor = currentUserId === post.authorId;
  const canPin = showActions;
  const canDelete = showActions && isAuthor;

  /* ------------------ FETCH SUMMARY ------------------ */
  const fetchReactions = async () => {
    try {
      setIsLoadingReactions(true);
      const res = await reactionApi.getReactionsSummary(post.id);
      const summary = res.data.data;
      if (!summary) return;
      const total = summary.reduce((sum, r) => sum + r.count, 0);
      const userReaction = summary.find(r => r.userReacted)?.emoji ?? null;

      setReactionSummary(summary);
      setReactionCount(total);
      setCurrentReaction(userReaction);
    } catch (err) {
      console.warn('Failed to fetch reactions');
    } finally {
      setIsLoadingReactions(false);
    }
  };

  /* ------------------ FETCH ALL REACTIONS FOR MODAL ------------------ */
  const fetchAllReactions = async () => {
    try {
      setLoadingReactionsModal(true);
      const res = await reactionApi.getReactions(post.id);
      setReactions(res.data.data ?? []);
    } catch (err) {
      console.warn('Failed to fetch full reactions');
    } finally {
      setLoadingReactionsModal(false);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [post.id]);

  /* ------------------ PIN / DELETE ------------------ */
  const handlePinToggle = async () => {
    setIsPinning(true);
    try {
      if (post.isPinned) await postApi.unpinPost(post.id);
      else await postApi.pinPost(post.id);

      onPostUpdated?.({ ...post, isPinned: !post.isPinned });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to update pin',
        visibilityTime: 3000,
      });
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await postApi.deletePost(post.id);
            onPostDeleted?.(post.id);
          } catch (err: any) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to delete post',
              visibilityTime: 3000,
            });
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleReactionChange = () => {
    fetchReactions();
  };

  const handleCommentCountChange = (newCount: number) => {
    setCommentCount(newCount);
  };

  if (isDeleting) {
    return (
      <View style={[styles.card, styles.deletingCard]}>
        <ActivityIndicator size="small" color="#9CA3AF" />
        <Text style={styles.deletingText}>Deleting...</Text>
      </View>
    );
  }

  /* ------------------ TOP EMOJIS ------------------ */
  const topEmojis = reactionSummary
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => router.push(`/user/${post.authorId}`)}
        >
          {post.author?.avatar ? (
            <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.avatarText}>
                {post.author?.fullName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.authorName}>{post.author?.fullName || 'Unknown'}</Text>
            <Text style={styles.time}>{new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
        {post.isPinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌 Pinned</Text>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <Text style={styles.content}>{post.content}</Text>

      {/* REACTION SUMMARY */}
      {reactionCount > 0 && (
        <Pressable
          style={styles.reactionSummary}
          onPress={() => {
            fetchAllReactions();
            setShowReactionModal(true);
          }}
        >
          <View style={styles.emojiStack}>
            {topEmojis.map((r, i) => (
              <View key={`${r.emoji}-${i}`} style={styles.emojiBubble}>
                <Text>{r.emoji}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.reactionCountText}>{reactionCount}</Text>
        </Pressable>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <ReactionBar
          postId={post.id}
          currentReaction={currentReaction}
          reactionCount={reactionCount}
          onReactionChange={handleReactionChange}
        />

        <Pressable style={styles.commentButton} onPress={() => setShowComments(true)}>
          <Text style={styles.commentText}>💬 {commentCount}</Text>
        </Pressable>

        {showActions && (canPin || canDelete) && (
          <View style={styles.actions}>
            {canPin && (
              <Pressable
                style={[styles.actionButton, post.isPinned && styles.pinnedAction]}
                onPress={handlePinToggle}
                disabled={isPinning}
              >
                {isPinning ? <ActivityIndicator size="small" color="#3B82F6" /> : <Text>{post.isPinned ? '📌 Unpin' : '📌 Pin'}</Text>}
              </Pressable>
            )}
            {canDelete && (
              <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* COMMENTS MODAL */}
      <Modal visible={showComments} animationType="slide">
        <CommentList
          postId={post.id}
          commentCount={commentCount}
          onCommentCountChange={handleCommentCountChange}
        />
      </Modal>

      {/* FULL REACTIONS MODAL */}
      <Modal visible={showReactionModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reactions</Text>
            <Pressable onPress={() => setShowReactionModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          {loadingReactionsModal ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={reactions}
              keyExtractor={(item, index) => item.id ? item.id.toString() : `reaction-${index}`}
              renderItem={({ item }) => (
                <View key={item.id} style={styles.reactionRow}>
                  {item.user?.avatar ? (
                    <Image source={{ uri: item.user.avatar }} style={styles.avatarSmall} />
                  ) : (
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarTextSmall}>
                        {item.user?.fullName?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.reactionUserName}>{item.user?.fullName || 'Unknown'}</Text>
                  <Text style={styles.reactionEmoji}>{item.emoji}</Text>
                  {item.userId === currentUserId && <Text style={styles.yourLabel}>(You)</Text>}
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  deletingCard: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  deletingText: { color: '#9CA3AF', marginLeft: 8 },

  /* HEADER */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  authorName: { fontWeight: '600', fontSize: 16, color: '#111827' },
  time: { color: '#6B7280', fontSize: 11 },
  pinnedBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pinnedText: { fontSize: 12 },

  /* CONTENT */
  content: { fontSize: 15, lineHeight: 22, marginVertical: 10, color: '#111827' },

  /* REACTION SUMMARY */
  reactionSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  emojiStack: { flexDirection: 'row', marginRight: 6 },
  emojiBubble: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  reactionCountText: { fontSize: 13, color: '#6B7280' },

  /* FOOTER */
  footer: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6' },
  commentText: { color: '#6B7280', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  pinnedAction: { backgroundColor: '#FEF3C7' },
  deleteButton: { backgroundColor: '#FEE2E2' },
  deleteButtonText: { color: '#DC2626', fontWeight: '600' },

  /* REACTION MODAL */
  modalContainer: { flex: 1, backgroundColor: '#FFF', marginTop: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalClose: { fontSize: 24, fontWeight: '600' },

  reactionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarTextSmall: { color: '#FFF', fontWeight: '600' },
  reactionUserName: { flex: 1, fontSize: 14 },
  reactionEmoji: { fontSize: 20, marginRight: 4 },
  yourLabel: { color: '#3B82F6', fontSize: 12 },
});
