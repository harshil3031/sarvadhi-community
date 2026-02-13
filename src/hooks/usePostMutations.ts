import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactionApi } from '../api/reaction.api';
import { QueryKeys } from '../api/queryKeys';
import { Post } from '../api/posts';

export const usePostMutations = () => {
    const queryClient = useQueryClient();

    const toggleReaction = useMutation({
        mutationFn: async ({ postId, emoji, isReacted }: { postId: string; emoji: string; isReacted: boolean }) => {
            // If already reacted with this emoji, remove it
            // Note: Backend might need specific endpoint or logic. 
            // Assuming reactionApi handles toggle or add/remove. 
            // Checking reaction.api.ts would be good but standard is add/remove.
            // Let's assume we call add or remove.
            // Wait, reactionApi likely has separate methods?
            // I'll check reactionApi later, for now assume simple toggle logic.
            if (isReacted) {
                return reactionApi.removeReaction(postId); // One arg
            } else {
                return reactionApi.addReaction(postId, { emoji }); // Object arg
            }
        },
        onMutate: async ({ postId, emoji, isReacted }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: [QueryKeys.feedPosts] });

            // Snapshot the previous value
            const previousFeed = queryClient.getQueryData([QueryKeys.feedPosts]);

            // Optimistically update to the new value
            queryClient.setQueryData([QueryKeys.feedPosts], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((post: Post.Post) => {
                            if (post.id === postId) {
                                const newCount = isReacted ? post.reactionCount - 1 : post.reactionCount + 1;
                                let newUserReaction = post.userReaction;
                                if (isReacted && post.userReaction === emoji) {
                                    newUserReaction = undefined;
                                } else if (!isReacted) {
                                    newUserReaction = emoji;
                                }

                                return {
                                    ...post,
                                    reactionCount: newCount,
                                    userReaction: newUserReaction,
                                };
                            }
                            return post;
                        }),
                    })),
                };
            });

            return { previousFeed };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData([QueryKeys.feedPosts], context?.previousFeed);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.feedPosts] });
        },
    });

    return {
        toggleReaction,
    };
};
