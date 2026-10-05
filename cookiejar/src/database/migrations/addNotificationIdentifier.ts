import type { SQLiteDatabase } from 'expo-sqlite';

export async function addNotificationIdentifier(database: SQLiteDatabase) {
  await database.execAsync(`
    ALTER TABLE notifications ADD COLUMN identifier TEXT;
    CREATE UNIQUE INDEX notifications_by_identifier ON notifications(identifier);
  `);
}
