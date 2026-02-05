/**
 * Jest Setup File
 * 
 * This file runs before all test suites.
 * Use it to configure global test utilities and setup.
 */

// Suppress console warnings in tests if needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('NativeEventEmitter')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
  clear: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  };
  return mockAxios;
});

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  return {
    io: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      emit,
      on: jest.fn(),
      off: jest.fn(),
    })),
  };
});

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.RNGestureHandlerModule = {
    State: {
      UNDETERMINED: 0,
      BEGAN: 1,
      ACTIVE: 2,
      CANCELLED: 3,
      FAILED: 4,
      END: 5,
    },
    attachGestureHandler: jest.fn(),
    createGestureHandler: jest.fn(),
    dropGestureHandler: jest.fn(),
    updateGestureHandler: jest.fn(),
  };
  return RN;
});
