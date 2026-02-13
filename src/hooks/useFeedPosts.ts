import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '../api/posts';

export const useFeedPosts = () => {
    return useInfiniteQuery({
        queryKey: ['feedPosts'],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await postApi.getFeedPosts(20, pageParam);
            return response.data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // If the last page has fewer items than the limit, we've reached the end
            if (!lastPage.data || lastPage.data.length < 20) {
                return undefined;
            }
            // Calculate next offset based on total items fetched so far
            return allPages.length * 20;
        },
    });
};
