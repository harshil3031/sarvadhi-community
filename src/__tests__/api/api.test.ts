/**
 * Example API Tests
 * 
 * Demonstrates testing API client calls using Jest mocks
 */

// Mock the API modules before importing
jest.mock('../../api/channels');
jest.mock('../../api/posts');

import { channelApi } from '../../api/channels';
import { postApi } from '../../api/posts';

describe('Channel API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicChannels', () => {
    it('should be defined', () => {
      expect(channelApi.getPublicChannels).toBeDefined();
    });
  });

  describe('joinChannel', () => {
    it('should be defined', () => {
      expect(channelApi.joinChannel).toBeDefined();
    });
  });
});

describe('Post API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should be defined', () => {
      expect(postApi.createPost).toBeDefined();
    });
  });

  describe('getPostsByChannel', () => {
    it('should be defined', () => {
      expect(postApi.getPostsByChannel).toBeDefined();
    });
  });

  describe('deletePost', () => {
    it('should be defined', () => {
      expect(postApi.deletePost).toBeDefined();
    });
  });
});
