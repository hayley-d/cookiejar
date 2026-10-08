export type TrackingType = 'repetitions' | 'repetitions_and_weight' | 'repetitions_and_assistance' | 'duration' | 'distance';

export const trackingTypes: TrackingType[] = [
  'repetitions',
  'repetitions_and_weight',
  'repetitions_and_assistance',
  'duration',
  'distance',
];

export const trackingTypeLabels: Record<TrackingType, string> = {
  repetitions: 'Reps',
  repetitions_and_weight: 'Kg × Reps',
  repetitions_and_assistance: 'Assist kg × Reps',
  duration: 'Time',
  distance: 'Distance',
};
