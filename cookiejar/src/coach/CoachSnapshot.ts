import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { PersonalRecordEvent } from '@/progress/listPersonalRecordsFromHistory';
import type { BodyMeasurement } from '@/types/BodyMeasurement';
import type { Exercise } from '@/types/Exercise';
import type { HealthSnapshot } from '@/types/HealthSnapshot';
import type { PlanWithEntries } from '@/types/PlanWithEntries';
import type { Profile } from '@/types/Profile';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type FinishedSessionWithSets = {
  sessionId: number;
  startedAt: string;
  workoutName: string;
  sets: readonly CompletedSet[];
};

export type CoachSnapshot = {
  now: Date;
  today: string;
  weekStartDate: string;
  profile: Profile | null;
  activePlan: PlanWithEntries | null;
  finishedSessionCount: number;
  sessionsLastTwelveWeeks: readonly FinishedSessionWithSets[];
  personalRecordsLastFourteenDays: readonly PersonalRecordEvent[];
  scheduledThisWeek: readonly ScheduledWorkout[];
  scheduledPreviousFourWeeks: readonly ScheduledWorkout[];
  healthLastFourteenDays: readonly HealthSnapshot[];
  latestBodyMeasurement: BodyMeasurement | null;
  exercisesById: ReadonlyMap<number, Exercise>;
};
