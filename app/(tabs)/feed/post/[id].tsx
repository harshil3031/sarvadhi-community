import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

import { postApi, Post } from '../../../../src/api/posts';
import { useAuthStore } from '../../../../src/store/auth.store';
import PostCard from '../../../../components/PostCard';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [post, setPost] = useState<Post.Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPost = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await postApi.getPost(String(id));
        const data = res.data.data;
        if (isMounted && data) {
          setPost(data);
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message || 'Failed to load post',
          visibilityTime: 3000,
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Post' }} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      ) : post ? (
        <PostCard post={post} currentUserId={user?.id} showActions />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Post not found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
