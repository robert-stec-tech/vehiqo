export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS work_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('driving', 'other_work', 'standby', 'break', 'rest')),
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_work_sessions_started_at
    ON work_sessions(started_at);

  CREATE INDEX IF NOT EXISTS idx_work_sessions_synced_at
    ON work_sessions(synced_at);

  CREATE TABLE IF NOT EXISTS daily_checks (
    id TEXT PRIMARY KEY NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('tractor', 'trailer')),
    started_at INTEGER NOT NULL,
    completed_at INTEGER,
    signature_uri TEXT,
    notes TEXT,
    gps_lat REAL,
    gps_lng REAL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_daily_checks_started_at
    ON daily_checks(started_at);

  CREATE TABLE IF NOT EXISTS daily_check_items (
    id TEXT PRIMARY KEY NOT NULL,
    daily_check_id TEXT NOT NULL REFERENCES daily_checks(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
    photo_uri TEXT,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_daily_check_items_check_id
    ON daily_check_items(daily_check_id);

  -- item_key is an i18n key resolved at runtime, e.g. 'dailyCheck.items.tyres'

  CREATE TABLE IF NOT EXISTS fatigue_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    woke_at INTEGER NOT NULL,
    slept_at INTEGER,
    duration_seconds INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_fatigue_sessions_woke_at
    ON fatigue_sessions(woke_at);

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;
