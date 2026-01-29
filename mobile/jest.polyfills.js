// Polyfills to avoid React Native Jest setup issues
// This file runs before jest.setup.js and before React Native's setup

// Override global timer functions to avoid Flow type syntax issues
global.clearImmediate = (immediateId) => {
  return clearTimeout(immediateId);
};

global.setImmediate = (callback, ...args) => {
  return setTimeout(callback, 0, ...args);
};

// Mock react-native Platform before it gets loaded
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
}));

// Mock react-native completely to avoid Flow syntax issues
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.Platform = {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
  };

  return RN;
});
