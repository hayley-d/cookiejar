import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Topic } from '@/coach/Topic';
import type { NuggieName } from '@/nuggies/NuggieName';
import type { BodyPart } from '@/types/BodyPart';

export type RuleIdentifier =
  | 'noData'
  | 'lowSleep'
  | 'elevatedRestingHeartRate'
  | 'newPersonalRecords'
  | 'missedSessions'
  | 'trainingLoadSpike'
  | 'plateau'
  | 'stalePlan'
  | 'streakMilestone'
  | 'muscleBalance'
  | 'noRecentWeighIn'
  | 'recoveryGood'
  | 'strengthTrend'
  | 'weekAhead';

export type CoachDestination =
  | { screen: 'exerciseHistory'; exerciseId: number }
  | { screen: 'planEditor'; planId: number }
  | { screen: 'addMeasurement' }
  | { screen: 'calendar' }
  | { screen: 'exerciseLibrary'; bodyPart: BodyPart };

export type InsightAction = {
  label: string;
  destination: CoachDestination;
};

export type Insight = {
  ruleIdentifier: RuleIdentifier;
  topics: readonly Topic[];
  priority: number;
  nuggie: NuggieName;
  messages: readonly string[];
  action: InsightAction | null;
};

export type InsightRule = (snapshot: CoachSnapshot) => Insight[];
