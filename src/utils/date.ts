/**
 * Date Utility Functions
 */

/**
 * Format message timestamp
 * Shows time for today's messages, date for older messages
 */
export const formatMessageTime = (date: string): string => {
  const messageDate = new Date(date);
  const today = new Date();

  // Check if same day
  if (
    messageDate.getFullYear() === today.getFullYear() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getDate() === today.getDate()
  ) {
    // Show time only for today
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Show date for older messages
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format conversation list time
 * Shows time for today, date for older, "Just now" for very recent
 */
export const formatConversationTime = (date: string): string => {
  const messageDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  }

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  if (diffHours < 24) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for message separator (e.g., "Today", "Yesterday", "Mar 15")
 */
export const formatMessageDateSeparator = (date: string): string => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if same day as today
  if (
    messageDate.getFullYear() === today.getFullYear() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getDate() === today.getDate()
  ) {
    return 'Today';
  }

  // Check if yesterday
  if (
    messageDate.getFullYear() === yesterday.getFullYear() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }

  // Show month and day for older dates
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
