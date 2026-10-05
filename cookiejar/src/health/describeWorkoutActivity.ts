const fallbackActivityName = 'Workout';

const activityNamesByCode: Readonly<Record<number, string>> = {
  9: 'Climbing',
  11: 'Cross Training',
  13: 'Cycling',
  14: 'Dance',
  16: 'Elliptical',
  20: 'Functional Strength Training',
  24: 'Hiking',
  28: 'Martial Arts',
  29: 'Mind and Body',
  30: 'Mixed Cardio',
  35: 'Rowing',
  37: 'Running',
  44: 'Stair Climbing',
  46: 'Swimming',
  50: 'Strength Training',
  52: 'Walking',
  57: 'Yoga',
  58: 'Barre',
  59: 'Core Training',
  62: 'Flexibility',
  63: 'High Intensity Interval Training',
  64: 'Jump Rope',
  65: 'Kickboxing',
  66: 'Pilates',
  68: 'Stairs',
  72: 'Tai Chi',
  73: 'Mixed Cardio',
  77: 'Cardio Dance',
};

export function describeWorkoutActivity(activityTypeCode: number): string {
  return activityNamesByCode[activityTypeCode] ?? fallbackActivityName;
}
