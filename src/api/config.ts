import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
  useMockApi?: boolean;
};

export const API_BASE_URL =
  extra.apiBaseUrl ?? 'https://api.example.local/api/v1';

export const USE_MOCK_API = extra.useMockApi !== false;
