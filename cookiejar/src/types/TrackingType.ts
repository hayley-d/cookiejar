export type TrackingType = 'repetitions' | 'repetitions_and_weight' | 'duration' | 'distance';

export const trackingTypes: TrackingType[] = ['repetitions', 'repetitions_and_weight', 'duration', 'distance'];

export const trackingTypeLabels: Record<TrackingType, string> = {
  repetitions: 'Reps',
  repetitions_and_weight: 'Kg × Reps',
  duration: 'Time',
  distance: 'Distance',
};
