export type ReactionType = "like" | "heart";

export type Post = {
  id: string;
  channelId: string;
  author: string;
  content: string;
  reactions: Record<ReactionType, number>;
  createdAt: string;
};
