import type { CollectorApi, LoginRequest, LoginResponse } from './types';
import { buildSeedBootstrap, MOCK_PHONE, MOCK_PIN } from './seed';
import type { ShiftCloseResult, SyncPaymentPayload, SyncResult } from '../types/models';

function delay(ms = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi: CollectorApi = {
  async login(req: LoginRequest): Promise<LoginResponse> {
    await delay(120);
    const phone = req.phone.replace(/\s/g, '');
    if (phone !== MOCK_PHONE || req.pin !== MOCK_PIN) {
      throw new Error('رقم الهاتف أو رمز الدخول غير صحيح');
    }
    const bootstrap = buildSeedBootstrap();
    return { session: bootstrap.session };
  },

  async bootstrap(_token: string) {
    await delay(150);
    return buildSeedBootstrap();
  },

  async sync(_token: string, payments: SyncPaymentPayload[]): Promise<SyncResult> {
    await delay(100);
    return {
      accepted: payments.map((p) => p.uuid),
      rejected: [],
      syncedAt: new Date().toISOString(),
    };
  },

  async closeShift(
    _token: string,
    systemTotal: number,
  ): Promise<ShiftCloseResult> {
    await delay(100);
    return {
      shiftId: `shift-${Date.now()}`,
      systemTotal,
      receiptCount: 0,
      fullCount: 0,
      partialCount: 0,
      remainingOnLine: 0,
      status: 'pending_handover',
      closedAt: new Date().toISOString(),
    };
  },
};
