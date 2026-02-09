import { router } from 'expo-router';

export const handleNotificationNavigation = (data: any) => {
  if (!data?.type) return;

  switch (data.type) {
    case 'post_comment':
    case 'post_reaction':
    case 'post_mention':
    case 'comment_mention':
      router.push(`/post/${data.referenceId}`);
      break;

    case 'dm_message':
      router.push(`/dm/${data.referenceId}`);
      break;

    case 'channel_invite':
      router.push(`/channels/${data.referenceId}`);
      break;

    case 'group_invite':
      router.push(`/groups/${data.referenceId}`);
      break;

    default:
      router.push('/(tabs)/notifications');
  }
};
