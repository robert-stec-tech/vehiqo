import {
  DAILY_REST_REDUCED_MS,
  WEEKLY_REST_REDUCED_MS,
} from '@/constants/euRegulations';
import { generateId } from '@/utils/id';

import { getDatabase } from './index';
import type { WorkMode, WorkSession } from './types';

export async function getCurrentWorkSession(): Promise<WorkSession | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkSession>(
    `SELECT * FROM work_sessions
     WHERE ended_at IS NULL
     ORDER BY started_at DESC
     LIMIT 1;`,
  );
  return row ?? null;
}

export async function startWorkSession(mode: WorkMode): Promise<WorkSession> {
  const db = await getDatabase();
  const now = Date.now();
  const id = generateId();

  await db.withTransactionAsync(async () => {
    const prev = await db.getFirstAsync<{ mode: WorkMode; started_at: number }>(
      `SELECT mode, started_at FROM work_sessions
       WHERE ended_at IS NULL
       ORDER BY started_at DESC
       LIMIT 1;`,
    );

    await db.runAsync(
      `UPDATE work_sessions
       SET ended_at = ?, updated_at = ?
       WHERE ended_at IS NULL;`,
      now,
      now,
    );

    // Persist the rest end so the daily/weekly driving counters anchor to a
    // precise point instead of scanning session history. The reduced legal
    // minimums (9h daily, 24h weekly) qualify a rest as a counter reset.
    if (prev?.mode === 'rest') {
      const duration = now - prev.started_at;
      if (duration >= DAILY_REST_REDUCED_MS) {
        await db.runAsync(
          `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
           VALUES ('last_daily_rest_end', ?, ?);`,
          String(now),
          now,
        );
      }
      if (duration >= WEEKLY_REST_REDUCED_MS) {
        await db.runAsync(
          `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
           VALUES ('last_weekly_rest_end', ?, ?);`,
          String(now),
          now,
        );
      }
    }

    await db.runAsync(
      `INSERT INTO work_sessions (id, mode, started_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?);`,
      id,
      mode,
      now,
      now,
      now,
    );
  });

  return {
    id,
    mode,
    started_at: now,
    ended_at: null,
    created_at: now,
    updated_at: now,
    synced_at: null,
  };
}

export async function getWorkSessionsInRange(
  from: number,
  to: number,
): Promise<WorkSession[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkSession>(
    `SELECT * FROM work_sessions
     WHERE started_at < ?
       AND (ended_at > ? OR ended_at IS NULL)
     ORDER BY started_at ASC;`,
    to,
    from,
  );
}

export interface WorkTimerSettings {
  lastDailyRestEnd: number | null;
  lastWeeklyRestEnd: number | null;
}

export async function getWorkTimerSettings(): Promise<WorkTimerSettings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM app_settings
     WHERE key IN ('last_daily_rest_end', 'last_weekly_rest_end');`,
  );

  const readTimestamp = (key: string): number | null => {
    const row = rows.find((r) => r.key === key);
    return row ? Number(row.value) : null;
  };

  return {
    lastDailyRestEnd: readTimestamp('last_daily_rest_end'),
    lastWeeklyRestEnd: readTimestamp('last_weekly_rest_end'),
  };
}
