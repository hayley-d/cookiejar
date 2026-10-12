export type BodyPart = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'core' | 'glutes' | 'quadriceps' | 'hamstrings' | 'calves' | 'full_body' | 'cardio' | 'mobility' | 'swimming';

export const bodyParts: BodyPart[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'glutes',
  'quadriceps',
  'hamstrings',
  'calves',
  'full_body',
  'cardio',
  'mobility',
  'swimming',
];

export const gymBodyParts: BodyPart[] = bodyParts.filter((bodyPart) => bodyPart !== 'swimming');

export const bodyPartLabels: Record<BodyPart, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  glutes: 'Glutes',
  quadriceps: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  full_body: 'Full body',
  cardio: 'Cardio',
  mobility: 'Mobility',
  swimming: 'Swimming',
};
