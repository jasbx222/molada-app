import type {
  BootstrapPayload,
  ShiftCloseResult,
  SyncPaymentPayload,
  SyncResult,
  CollectorSession,
} from '../types/models';

export interface LoginRequest {
  phone: string;
  pin: string;
  deviceId: string;
}

/** Compatible with mock (session only) and real API (tokens + session). */
export interface LoginResponse {
  session: CollectorSession;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CollectorApi {
  login(req: LoginRequest): Promise<LoginResponse>;
  bootstrap(token: string): Promise<BootstrapPayload>;
  sync(token: string, payments: SyncPaymentPayload[]): Promise<SyncResult>;
  closeShift(token: string, systemTotal: number): Promise<ShiftCloseResult>;
  refresh?(refreshToken: string): Promise<RefreshResponse>;
  logout?(refreshToken?: string): Promise<void>;
}
