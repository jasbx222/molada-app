import { API_BASE_URL } from './config';
import type {
  CollectorApi,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from './types';
import type {
  BootstrapPayload,
  ShiftCloseResult,
  SyncPaymentPayload,
  SyncResult,
} from '../types/models';

type TokenStore = {
  accessToken: string | null;
  refreshToken: string | null;
};

const tokens: TokenStore = { accessToken: null, refreshToken: null };

export function setHttpTokens(access: string | null, refresh: string | null) {
  tokens.accessToken = access;
  tokens.refreshToken = refresh;
}

export function getHttpTokens() {
  return { ...tokens };
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const j = JSON.parse(text) as { message?: string };
    if (j?.message) return j.message;
  } catch {
    /* plain text */
  }
  return text || `HTTP ${res.status}`;
}

async function rawRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  const bearer = token ?? tokens.accessToken;
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function requestWithRefresh<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const unauthorized =
      msg.includes('401') ||
      msg.includes('غير مصرح') ||
      /HTTP 401/.test(msg);
    if (!unauthorized || !tokens.refreshToken) throw err;

    const refreshed = await rawRequest<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    setHttpTokens(refreshed.accessToken, refreshed.refreshToken);
    return rawRequest<T>(path, {
      ...options,
      token: refreshed.accessToken,
    });
  }
}

/** Real ASP.NET Core client — used when useMockApi is false */
export const httpApi: CollectorApi = {
  async login(req: LoginRequest): Promise<LoginResponse> {
    const data = await rawRequest<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      session: LoginResponse['session'];
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });

    const session = {
      ...data.session,
      token: data.accessToken || data.session.token,
    };
    setHttpTokens(data.accessToken, data.refreshToken);
    return {
      session,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  },

  bootstrap(token: string): Promise<BootstrapPayload> {
    return requestWithRefresh('/collector/bootstrap', { method: 'GET', token });
  },

  sync(token: string, payments: SyncPaymentPayload[]): Promise<SyncResult> {
    return requestWithRefresh('/collector/sync', {
      method: 'POST',
      token,
      body: JSON.stringify({ payments }),
    });
  },

  closeShift(token: string, systemTotal: number): Promise<ShiftCloseResult> {
    return requestWithRefresh('/collector/shifts/close', {
      method: 'POST',
      token,
      body: JSON.stringify({ systemTotal }),
    });
  },

  refresh(refreshToken: string): Promise<RefreshResponse> {
    return rawRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async logout(refreshToken?: string): Promise<void> {
    const rt = refreshToken ?? tokens.refreshToken;
    if (rt) {
      await rawRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => undefined);
    }
    setHttpTokens(null, null);
  },
};
