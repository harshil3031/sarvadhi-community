/**
 * API Layer Index
 * Centralized exports for all API modules
 */

// API Client
export { default as apiClient } from './client';
export type { ApiErrorResponse, ApiResponse } from './client';

// Auth API
export { authApi } from './auth';
export type { Auth } from './auth';

// Channel API
export { channelApi } from './channels';
export type { Channel } from './channels';

// Group API
export { groupApi } from './group.api';
export type { Group } from './group.api';

// Post API
export { postApi } from './posts';
export type { Post } from './posts';

// Comment API
export { commentApi } from './comment.api';
export type { Comment } from './comment.api';

// Direct Message API
export { dmApi } from './dm.api';
export type { DM } from './dm.api';

// Notification API
export { notificationApi } from './notification.api';
export type { Notification } from './notification.api';

// Reaction API
export { reactionApi } from './reaction.api';
export type { Reaction } from './reaction.api';

