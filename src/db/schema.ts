export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alley TEXT NOT NULL,
  house TEXT NOT NULL,
  cable_no TEXT NOT NULL,
  amps INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  zone_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY NOT NULL,
  subscriber_id TEXT NOT NULL,
  cycle_month TEXT NOT NULL,
  amps INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  amp_price INTEGER NOT NULL,
  official_amp_price INTEGER NOT NULL,
  invoice_amount INTEGER NOT NULL,
  carried_debt INTEGER NOT NULL,
  discount INTEGER NOT NULL,
  total_due INTEGER NOT NULL,
  paid_amount INTEGER NOT NULL,
  remaining INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  uuid TEXT PRIMARY KEY NOT NULL,
  invoice_id TEXT NOT NULL,
  subscriber_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  receipt_no INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0,
  collector_name TEXT NOT NULL,
  statement_token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS receipt_range (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  range_from INTEGER NOT NULL,
  range_to INTEGER NOT NULL,
  next_no INTEGER NOT NULL
);
`;
