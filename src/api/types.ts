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

export interface LoginResponse {
  session: CollectorSession;
}

export interface CollectorApi {
  login(req: LoginRequest): Promise<LoginResponse>;
  bootstrap(token: string): Promise<BootstrapPayload>;
  sync(token: string, payments: SyncPaymentPayload[]): Promise<SyncResult>;
  closeShift(token: string, systemTotal: number): Promise<ShiftCloseResult>;
}
