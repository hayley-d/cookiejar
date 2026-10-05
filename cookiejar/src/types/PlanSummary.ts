import type { Plan } from '@/types/Plan';

export type PlanSummary = Plan & {
  entryCount: number;
};
