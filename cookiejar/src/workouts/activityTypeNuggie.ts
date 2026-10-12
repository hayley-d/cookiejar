import type { NuggieName } from '@/nuggies/NuggieName';
import type { ActivityType } from '@/types/ActivityType';

const activityTypeNuggies: Record<ActivityType, NuggieName> = {
  hike: 'hiking',
  run: 'workout',
  walk: 'goodJob',
};

export function activityTypeNuggie(activityType: ActivityType): NuggieName {
  return activityTypeNuggies[activityType];
}
