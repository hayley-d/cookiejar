import type { SQLiteDatabase } from 'expo-sqlite';

import { createInitialSchema } from '@/database/migrations/createInitialSchema';

type Migration = (database: SQLiteDatabase) => Promise<void>;

export const migrations: Migration[] = [createInitialSchema];
