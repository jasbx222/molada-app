import { API_BASE_URL } from './config';
import type { CollectorApi, LoginRequest, LoginResponse } from './types';
import type {
  BootstrapPayload,
  ShiftCloseResult,
  SyncPaymentPayload,
  SyncResult,
} from '../types/models';

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Real ASP.NET Core client — used when useMockApi is false */
export const httpApi: CollectorApi = {
  login(req: LoginRequest): Promise<LoginResponse> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  bootstrap(token: string): Promise<BootstrapPayload> {
    return request('/collector/bootstrap', { method: 'GET', token });
  },

  sync(token: string, payments: SyncPaymentPayload[]): Promise<SyncResult> {
    return request('/collector/sync', {
      method: 'POST',
      token,
      body: JSON.stringify({ payments }),
    });
  },

  closeShift(token: string, systemTotal: number): Promise<ShiftCloseResult> {
    return request('/collector/shifts/close', {
      method: 'POST',
      token,
      body: JSON.stringify({ systemTotal }),
    });
  },
};
