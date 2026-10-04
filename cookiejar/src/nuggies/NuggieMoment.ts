import type { ClassType } from '@/types/ClassType';

export type NuggieMoment =
  | { kind: 'appLoading' }
  | { kind: 'sessionStarting'; startsAt: Date }
  | { kind: 'sessionInProgress' }
  | { kind: 'sessionFinished'; workoutKind: 'individual' | 'class'; personalRecordCount: number }
  | { kind: 'classDisplay'; classType: ClassType }
  | { kind: 'restDay' }
  | { kind: 'lowSleep' }
  | { kind: 'stepGoalReached' }
  | { kind: 'weeklyTargetMet' }
  | { kind: 'notifications' }
  | { kind: 'analytics' }
  | { kind: 'coach' };
