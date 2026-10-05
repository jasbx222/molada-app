import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
  useMockApi?: boolean;
};

/**
 * Resolution order:
 * 1) EXPO_PUBLIC_* (Metro inlines at bundle time — used by `export:web:live`)
 * 2) app.config.js / app.json extra
 * 3) safe placeholders
 *
 * Default app.json keeps useMockApi=true for native Expo Go.
 * Live web preview builds with:
 *   EXPO_PUBLIC_USE_MOCK_API=false EXPO_PUBLIC_API_BASE_URL=/api/v1
 * and is served by tools/preview-server.mjs (proxies /api -> :5080).
 */
const envMock = process.env.EXPO_PUBLIC_USE_MOCK_API;
const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL =
  (envBase && envBase.length > 0 ? envBase : null) ??
  extra.apiBaseUrl ??
  'https://api.example.local/api/v1';

export const USE_MOCK_API =
  envMock !== undefined && envMock !== ''
    ? envMock !== 'false' && envMock !== '0'
    : extra.useMockApi !== false;
