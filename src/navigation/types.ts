/**
 * Navigation types
 */

export type RootStackParamList = {
  MainTabs: undefined;
  ChannelDetails: { channelId: string; channelName: string };
  Chat: { userId: string; userName: string };
  EditProfile: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Channels: undefined;
  Messages: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type FeedStackParamList = {
  Feed: undefined;
  PostDetails: { postId: string };
};

export type ChannelStackParamList = {
  ChannelList: undefined;
  ChannelDetails: { channelId: string; channelName: string };
};

export type MessageStackParamList = {
  ChatList: undefined;
  Chat: { userId: string; userName: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};
