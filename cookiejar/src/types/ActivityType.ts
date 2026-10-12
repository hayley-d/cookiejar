export type ActivityType = 'hike' | 'run' | 'walk';

export const activityTypes: ActivityType[] = ['hike', 'run', 'walk'];

export const activityTypeLabels: Record<ActivityType, string> = {
  hike: 'Hike',
  run: 'Run',
  walk: 'Walk',
};
