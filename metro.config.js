// metro.config.js

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for "Cannot assign to read-only property 'NONE'" error
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true, // Preserve class names
    keep_fnames: true,     // Preserve function names
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Ensure source maps are enabled for better debugging
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;