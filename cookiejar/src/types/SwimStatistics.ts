import type { SwimStrokeDistance } from '@/swimming/swimSessionTotals';

export type SwimTotals = {
  swimCount: number;
  distanceMeters: number;
};

export type SwimStatistics = {
  thisMonth: SwimTotals;
  allTime: SwimTotals;
  longestDistanceMeters: number | null;
  fastestPaceSecondsPerHundredMeters: number | null;
  strokeDistances: SwimStrokeDistance[];
};
