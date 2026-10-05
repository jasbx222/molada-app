import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
  useMockApi?: boolean;
};

/**
 * Public static build on port 4310 keeps useMockApi=true (see app.json).
 * For local/dev against the ASP.NET API, set extra.useMockApi=false and
 * extra.apiBaseUrl to a reachable host (not localhost from a public tunnel).
 */
export const API_BASE_URL =
  extra.apiBaseUrl ?? 'https://api.example.local/api/v1';

export const USE_MOCK_API = extra.useMockApi !== false;
