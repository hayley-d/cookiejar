import type { SQLiteDatabase } from 'expo-sqlite';

type AppSettingRow = {
  value: string;
};

export async function getSetting(database: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await database.getFirstAsync<AppSettingRow>('SELECT value FROM app_settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(database: SQLiteDatabase, key: string, value: string): Promise<void> {
  await database.runAsync(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}
