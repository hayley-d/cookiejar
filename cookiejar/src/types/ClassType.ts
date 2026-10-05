export type ClassType = 'yoga' | 'pilates' | 'spin' | 'hiking' | 'barre' | 'other';

export const classTypes: ClassType[] = ['yoga', 'pilates', 'spin', 'hiking', 'barre', 'other'];

export const classTypeLabels: Record<ClassType, string> = {
  yoga: 'Yoga',
  pilates: 'Pilates',
  spin: 'Spin',
  hiking: 'Hiking',
  barre: 'Barre',
  other: 'Other',
};
