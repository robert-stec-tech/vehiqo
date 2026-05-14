import { getDatabase } from './index';
import { generateId } from '../utils/id';
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
    await db.runAsync(
      `UPDATE work_sessions
       SET ended_at = ?, updated_at = ?
       WHERE ended_at IS NULL;`,
      now,
      now,
    );
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
