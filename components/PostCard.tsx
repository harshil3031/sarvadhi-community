import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Post } from '../src/api/posts';
import { postApi } from '../src/api/posts';
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
  const [isPinning, setIsPinning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const isAuthor = currentUserId === post.authorId;
  
  // Show pin/unpin for all users (backend enforces permissions)
  const canPin = showActions;
  const canDelete = showActions && isAuthor;

  const handlePinToggle = async () => {
    setIsPinning(true);
    try {
      if (post.isPinned) {
        await postApi.unpinPost(post.id);
      } else {
        await postApi.pinPost(post.id);
      }

      // Optimistic UI update
      const updatedPost = { ...post, isPinned: !post.isPinned };
      onPostUpdated?.(updatedPost);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
        `Failed to ${post.isPinned ? 'unpin' : 'pin'} post`;
      Alert.alert('Error', errorMessage);
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
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
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete post');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleReactionChange = () => {
    // Refresh counts after reaction - handled by ReactionBar optimistic UI
  };

  const handleCommentCountChange = (newCount: number) => {
    setCommentCount(newCount);
  };

  if (isDeleting) {
    return (
      <View style={[styles.postCard, styles.deletingCard]}>
        <ActivityIndicator size="small" color="#9CA3AF" />
        <Text style={styles.deletingText}>Deleting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.author?.fullName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{post.author?.fullName || 'Unknown'}</Text>
            <Text style={styles.postTime}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        
        {post.isPinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌 Pinned</Text>
          </View>
        )}
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postFooter}>
        <View style={styles.interactionRow}>
          <ReactionBar
            postId={post.id}
            currentReaction={null}
            reactionCount={reactionCount}
            onReactionChange={handleReactionChange}
          />
          
          <Pressable
            style={({ pressed }) => [
              styles.commentButton,
              pressed && styles.commentButtonPressed,
            ]}
            onPress={() => setShowComments(true)}
          >
            <Text style={styles.commentButtonText}>
              💬 {commentCount}
            </Text>
          </Pressable>
        </View>

        {showActions && (canPin || canDelete) && (
          <View style={styles.actions}>
            {canPin && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handlePinToggle}
                disabled={isPinning}
              >
                {isPinning ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {post.isPinned ? '📌 Unpin' : '📌 Pin'}
                  </Text>
                )}
              </Pressable>
            )}
            
            {canDelete && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleDelete}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  🗑️ Delete
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <Pressable onPress={() => setShowComments(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>
          <CommentList
            postId={post.id}
            commentCount={commentCount}
            onCommentCountChange={handleCommentCountChange}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deletingCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    opacity: 0.5,
  },
  deletingText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  postTime: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  pinnedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pinnedText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  commentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  commentButtonPressed: {
    opacity: 0.7,
  },
  commentButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#DC2626',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '600',
  },
});
