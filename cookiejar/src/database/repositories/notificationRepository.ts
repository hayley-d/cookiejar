import type { SQLiteDatabase } from 'expo-sqlite';

import type { NuggieName } from '@/nuggies/NuggieName';
import type { AppNotification } from '@/types/AppNotification';

type NotificationRow = {
  id: number;
  identifier: string | null;
  title: string;
  body: string;
  nuggie: string;
  route: string | null;
  created_at: string;
  read_at: string | null;
};

type CountRow = {
  count: number;
};

export type RecordedNotification = {
  identifier: string;
  title: string;
  body: string;
  nuggie: NuggieName;
  route: string | null;
  createdAt: string;
};

function toAppNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    identifier: row.identifier,
    title: row.title,
    body: row.body,
    nuggie: row.nuggie as NuggieName,
    route: row.route,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

export async function upsertNotification(
  database: SQLiteDatabase,
  recordedNotification: RecordedNotification,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO notifications (identifier, title, body, nuggie, route, created_at, read_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(identifier) DO UPDATE SET
       title = excluded.title,
       body = excluded.body,
       nuggie = excluded.nuggie,
       route = excluded.route,
       created_at = excluded.created_at,
       read_at = NULL`,
    recordedNotification.identifier,
    recordedNotification.title,
    recordedNotification.body,
    recordedNotification.nuggie,
    recordedNotification.route,
    recordedNotification.createdAt,
  );
}

export async function deleteFutureNotificationsWithIdentifierPrefix(
  database: SQLiteDatabase,
  identifierPrefix: string,
  now: Date,
): Promise<void> {
  await database.runAsync(
    'DELETE FROM notifications WHERE substr(identifier, 1, length(?)) = ? AND created_at > ?',
    identifierPrefix,
    identifierPrefix,
    now.toISOString(),
  );
}

export async function listPastNotifications(database: SQLiteDatabase, now: Date): Promise<AppNotification[]> {
  const rows = await database.getAllAsync<NotificationRow>(
    `SELECT id, identifier, title, body, nuggie, route, created_at, read_at
     FROM notifications
     WHERE created_at <= ?
     ORDER BY created_at DESC, id DESC`,
    now.toISOString(),
  );
  return rows.map(toAppNotification);
}

export async function listPastNotificationIdentifiersWithPrefix(
  database: SQLiteDatabase,
  identifierPrefix: string,
  now: Date,
): Promise<Set<string>> {
  const rows = await database.getAllAsync<{ identifier: string }>(
    'SELECT identifier FROM notifications WHERE substr(identifier, 1, length(?)) = ? AND created_at <= ?',
    identifierPrefix,
    identifierPrefix,
    now.toISOString(),
  );
  return new Set(rows.map((row) => row.identifier));
}

export async function countPastUnreadNotifications(database: SQLiteDatabase, now: Date): Promise<number> {
  const row = await database.getFirstAsync<CountRow>(
    'SELECT COUNT(*) AS count FROM notifications WHERE created_at <= ? AND read_at IS NULL',
    now.toISOString(),
  );
  return row?.count ?? 0;
}

export async function markNotificationRead(database: SQLiteDatabase, notificationId: number, now: Date): Promise<void> {
  await database.runAsync(
    'UPDATE notifications SET read_at = ? WHERE id = ? AND read_at IS NULL',
    now.toISOString(),
    notificationId,
  );
}

export async function markNotificationReadByIdentifier(
  database: SQLiteDatabase,
  identifier: string,
  now: Date,
): Promise<void> {
  await database.runAsync(
    'UPDATE notifications SET read_at = ? WHERE identifier = ? AND read_at IS NULL',
    now.toISOString(),
    identifier,
  );
}

export async function markAllNotificationsRead(database: SQLiteDatabase, now: Date): Promise<void> {
  const nowText = now.toISOString();
  await database.runAsync(
    'UPDATE notifications SET read_at = ? WHERE created_at <= ? AND read_at IS NULL',
    nowText,
    nowText,
  );
}
