module.exports = {
  // Use react-native preset as base
  preset: 'react-native',
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Transform files with babel
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Module name mapper for handling imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Files to test
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Ignore test-utils.ts
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/.expo/',
    '/src/__tests__/setup/test-utils.ts',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  
  // Test environment
  testEnvironment: 'node',
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(expo|react-native|@react-native|@react-navigation|@react-native-async-storage|socket.io-client)/)',
  ],
  
  // Verbose output
  verbose: true,
};
