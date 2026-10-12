import type { ActivityType } from '@/types/ActivityType';
import type { ClassType } from '@/types/ClassType';
import type { WorkoutKind } from '@/types/WorkoutKind';

export type NuggieMoment =
  | { kind: 'appLoading' }
  | { kind: 'sessionStarting'; startsAt: Date }
  | { kind: 'sessionInProgress' }
  | { kind: 'sessionFinished'; workoutKind: WorkoutKind; personalRecordCount: number }
  | { kind: 'classDisplay'; classType: ClassType }
  | { kind: 'activityDisplay'; activityType: ActivityType }
  | { kind: 'restDay' }
  | { kind: 'lowSleep' }
  | { kind: 'stepGoalReached' }
  | { kind: 'weeklyTargetMet' }
  | { kind: 'notifications' }
  | { kind: 'analytics' }
  | { kind: 'coach' };
