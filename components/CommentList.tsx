import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { commentApi, Comment } from '../src/api/comment.api';
import { useAuthStore } from '../src/store';

interface CommentListProps {
  postId: string;
  commentCount: number;
  onCommentCountChange?: (newCount: number) => void;
}

export default function CommentList({
  postId,
  commentCount,
  onCommentCountChange,
}: CommentListProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment.Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Add comment state
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const LIMIT = 20;

  // Fetch comments
  const fetchComments = async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setOffset(0);
    }

    try {
      const currentOffset = reset ? 0 : offset;
      const response = await commentApi.getComments(postId, LIMIT, currentOffset);

      if (response.data.success && response.data.data) {
        const newComments = response.data.data;

        if (reset) {
          setComments(newComments);
          setOffset(LIMIT);
        } else {
          setComments(prev => [...prev, ...newComments]);
          setOffset(prev => prev + LIMIT);
        }

        setHasMore(newComments.length === LIMIT);
      }
    } catch (error: any) {
      console.error('Failed to fetch comments:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load comments',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments(true);
  }, [postId]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      fetchComments(false);
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Comment cannot be empty',
        visibilityTime: 3000,
      });
      return;
    }

    if (content.length > 2000) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Comment is too long (max 2000 characters)',
        visibilityTime: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await commentApi.createComment(postId, { content });

      if (response.data.success && response.data.data) {
        // Add comment to list
        setComments(prev => [response.data.data!, ...prev]);
        setNewComment('');

        // Update comment count
        onCommentCountChange?.(commentCount + 1);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add comment',
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentApi.deleteComment(commentId);
              setComments(prev => prev.filter(c => c.id !== commentId));
              onCommentCountChange?.(Math.max(0, commentCount - 1));
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to delete comment',
                visibilityTime: 3000,
              });
            }
          },
        },
      ]
    );
  };

  const renderComment = ({ item }: { item: Comment.Comment }) => {
    const isAuthor = user?.id === item.authorId;

    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <TouchableOpacity
            style={styles.commentAuthorInfo}
            onPress={() => router.push(`/user/${item.authorId}`)}
          >
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>
                {item.author?.fullName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.commentAuthorName}>{item.author?.fullName || 'Unknown'}</Text>
              <Text style={styles.commentTime}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </TouchableOpacity>

          {isAuthor && (
            <Pressable
              style={styles.deleteCommentButton}
              onPress={() => handleDeleteComment(item.id)}
            >
              <Text style={styles.deleteCommentText}>🗑️</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user?.fullName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          placeholderTextColor="#9CA3AF"
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={2000}
          editable={!isSubmitting}
        />
        <Pressable
          style={[styles.sendButton, (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!newComment.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </Pressable>
      </View>

      {/* Comments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : null
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingVertical: 8,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteCommentButton: {
    padding: 4,
  },
  deleteCommentText: {
    fontSize: 16,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
