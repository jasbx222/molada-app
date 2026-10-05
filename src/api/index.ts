import { USE_MOCK_API } from './config';
import { mockApi } from './mock';
import { httpApi } from './http';
import type { CollectorApi } from './types';

export type { CollectorApi, LoginRequest, LoginResponse } from './types';
export { API_BASE_URL, USE_MOCK_API } from './config';
export { MOCK_PHONE, MOCK_PIN } from './seed';

export const api: CollectorApi = USE_MOCK_API ? mockApi : httpApi;
