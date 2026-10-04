import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from '@/database/migrations/migrations';

type UserVersionRow = {
  user_version: number;
};

export async function migrateDatabase(database: SQLiteDatabase) {
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const userVersionRow = await database.getFirstAsync<UserVersionRow>('PRAGMA user_version');
  const currentVersion = userVersionRow?.user_version ?? 0;

  for (let migrationIndex = currentVersion; migrationIndex < migrations.length; migrationIndex++) {
    const nextVersion = migrationIndex + 1;
    await database.withTransactionAsync(async () => {
      await migrations[migrationIndex](database);
      await database.execAsync(`PRAGMA user_version = ${nextVersion}`);
    });
  }
}
