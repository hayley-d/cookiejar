import type { SQLiteDatabase } from 'expo-sqlite';

import type { ProfileUpdate } from '@/profile/validateProfileForm';
import type { Profile } from '@/types/Profile';

type ProfileRow = {
  id: number;
  display_name: string | null;
  birth_date: string | null;
  sex: Profile['sex'];
  height_centimetres: number | null;
  goal: Profile['goal'];
  weekly_workout_target: number;
  daily_step_goal: number;
  updated_at: string;
};

const profileId = 1;

export async function getProfile(database: SQLiteDatabase): Promise<Profile | null> {
  const row = await database.getFirstAsync<ProfileRow>(
    `SELECT id, display_name, birth_date, sex, height_centimetres, goal, weekly_workout_target, daily_step_goal,
            updated_at
     FROM profile
     WHERE id = ?`,
    profileId,
  );
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    displayName: row.display_name,
    birthDate: row.birth_date,
    sex: row.sex,
    heightCentimetres: row.height_centimetres,
    goal: row.goal,
    weeklyWorkoutTarget: row.weekly_workout_target,
    dailyStepGoal: row.daily_step_goal,
    updatedAt: row.updated_at,
  };
}

export async function updateProfile(database: SQLiteDatabase, profileUpdate: ProfileUpdate): Promise<void> {
  await database.runAsync(
    `UPDATE profile
     SET display_name = ?, birth_date = ?, sex = ?, height_centimetres = ?, goal = ?, weekly_workout_target = ?,
         daily_step_goal = ?, updated_at = ?
     WHERE id = ?`,
    profileUpdate.displayName,
    profileUpdate.birthDate,
    profileUpdate.sex,
    profileUpdate.heightCentimetres,
    profileUpdate.goal,
    profileUpdate.weeklyWorkoutTarget,
    profileUpdate.dailyStepGoal,
    new Date().toISOString(),
    profileId,
  );
}
