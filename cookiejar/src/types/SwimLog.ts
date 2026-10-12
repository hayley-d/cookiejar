import type { SwimStrokeDistance } from '@/swimming/swimSessionTotals';

export type SwimLog = {
  startedAt: string;
  durationSeconds: number;
  distanceMeters: number;
  strokeDistances: SwimStrokeDistance[];
};
