import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from '@/database/migrations/migrations';

type UserVersionRow = {
  user_version: number;
};

export async function migrateDatabase(database: SQLiteDatabase) {
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = OFF;');

  const userVersionRow = await database.getFirstAsync<UserVersionRow>('PRAGMA user_version');
  const currentVersion = userVersionRow?.user_version ?? 0;

  for (let migrationIndex = currentVersion; migrationIndex < migrations.length; migrationIndex++) {
    const nextVersion = migrationIndex + 1;
    await database.withTransactionAsync(async () => {
      await migrations[migrationIndex](database);
      const foreignKeyViolations = await database.getAllAsync('PRAGMA foreign_key_check');
      if (foreignKeyViolations.length > 0) {
        throw new Error(`Migration ${nextVersion} left ${foreignKeyViolations.length} foreign key violations`);
      }
      await database.execAsync(`PRAGMA user_version = ${nextVersion}`);
    });
  }

  await database.execAsync('PRAGMA foreign_keys = ON;');
}
