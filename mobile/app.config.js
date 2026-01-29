export default {
  expo: {
    name: 'Lost Device Finder',
    slug: 'lost-device-finder',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourcompany.lostdevicefinder',
      infoPlist: {
        UIBackgroundModes: ['audio']
      }
    },
    android: {
      package: 'com.yourcompany.lostdevicefinder',
      permissions: []
    },
    plugins: [],
    scheme: 'lostdevicefinder'
  }
};
