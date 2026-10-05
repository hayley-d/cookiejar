import type { ClassType } from '@/types/ClassType';

export type ClassStatistics = {
  classType: ClassType;
  sessionCount: number;
  totalSeconds: number;
  sessionsThisMonth: number;
  lastStartedAt: string;
};
