/**
 * Build-time config. Defaults keep native/dev on mock API.
 * Web preview (same-origin proxy) overrides via env:
 *   EXPO_PUBLIC_USE_MOCK_API=false EXPO_PUBLIC_API_BASE_URL=/api/v1 npx expo export --platform web
 */
const base = require('./app.json');

const useMockEnv = process.env.EXPO_PUBLIC_USE_MOCK_API;
const apiBaseEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

const useMockApi =
  useMockEnv === undefined || useMockEnv === ''
    ? base.expo.extra?.useMockApi !== false
    : useMockEnv !== 'false' && useMockEnv !== '0';

const apiBaseUrl =
  apiBaseEnv && apiBaseEnv.length > 0
    ? apiBaseEnv
    : base.expo.extra?.apiBaseUrl ?? 'https://api.example.local/api/v1';

module.exports = {
  ...base,
  expo: {
    ...base.expo,
    extra: {
      ...(base.expo.extra || {}),
      useMockApi,
      apiBaseUrl,
    },
  },
};
