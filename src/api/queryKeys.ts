export const QueryKeys = {
    feedPosts: 'feedPosts',
    channelPosts: (channelId: string) => ['channelPosts', channelId],
    groupPosts: (groupId: string) => ['groupPosts', groupId],
    postReactions: (postId: string) => ['postReactions', postId],
    postComments: (postId: string) => ['postComments', postId],
};
