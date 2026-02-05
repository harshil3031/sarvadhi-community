/**
 * Test Utilities and Setup
 * 
 * Provides custom render functions and common test utilities
 * for React Native Testing Library
 */

import React, { ReactElement } from 'react';
import { render, RenderAPI } from '@testing-library/react-native';

/**
 * Custom render function that wraps components with providers
 * Extend this as you add more context providers (Theme, Auth, etc.)
 */
interface CustomRenderOptions {
  // Add any custom options here
}

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
  // TODO: Add providers as needed
  // return (
  //   <AuthProvider>
  //     <ThemeProvider>
  //       {children}
  //     </ThemeProvider>
  //   </AuthProvider>
  // );
};

export const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderAPI => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from react-native testing library
export * from '@testing-library/react-native';

// Export custom render
export { customRender as render };

/**
 * Common test data factories
 */
export const testDataFactories = {
  createMockPost: (overrides = {}) => ({
    id: 'post-1',
    content: 'Test post content',
    channelId: 'channel-1',
    groupId: undefined,
    authorId: 'user-1',
    author: {
      id: 'user-1',
      fullName: 'Test User',
      avatar: undefined,
    },
    isPinned: false,
    reactionCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  createMockChannel: (overrides = {}) => ({
    id: 'channel-1',
    name: 'Test Channel',
    description: 'A test channel',
    creatorId: 'user-1',
    isPrivate: false,
    isMember: false,
    memberCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  createMockUser: (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    avatar: undefined,
    ...overrides,
  }),
};

/**
 * Custom matchers
 */
expect.extend({
  toHaveBeenCalledWithPost(received, post) {
    const pass = received.mock.calls.some((call) =>
      call.some((arg) => arg?.id === post.id)
    );

    return {
      pass,
      message: () =>
        pass
          ? `Expected not to have been called with post ${post.id}`
          : `Expected to have been called with post ${post.id}`,
    };
  },
});
