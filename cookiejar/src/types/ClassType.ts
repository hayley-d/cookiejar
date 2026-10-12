export type ClassType = 'yoga' | 'pilates' | 'spin' | 'barre' | 'other';

export const classTypes: ClassType[] = ['yoga', 'pilates', 'spin', 'barre', 'other'];

export const classTypeLabels: Record<ClassType, string> = {
  yoga: 'Yoga',
  pilates: 'Pilates',
  spin: 'Spin',
  barre: 'Barre',
  other: 'Other',
};
