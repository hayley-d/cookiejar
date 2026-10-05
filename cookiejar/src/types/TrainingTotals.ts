export type TrainingTotals = {
  workoutCount: number;
  timeTrainedSeconds: number;
  volumeKilograms: number;
};

export type TrainingTotalsRange = {
  startDate: string | null;
  endDate: string;
};
