import type { NuggieMoment } from '@/nuggies/NuggieMoment';
import type { NuggieName } from '@/nuggies/NuggieName';
import type { ClassType } from '@/types/ClassType';

type NuggieResolver<Moment extends NuggieMoment> = (moment: Moment, now: Date, random: () => number) => NuggieName;

type NuggieRule<Moment extends NuggieMoment> = NuggieName | NuggieResolver<Moment>;

type NuggieRules = {
  [Kind in NuggieMoment['kind']]: NuggieRule<Extract<NuggieMoment, { kind: Kind }>>;
};

const earlyMorningStartHour = 5;
const workoutStartHour = 8;
const sleepingStartHour = 22;

const celebrateNuggies: readonly NuggieName[] = ['celebrate', 'celebrateAlternate', 'celebrateThird'];

const classTypeNuggies: Record<ClassType, NuggieName> = {
  yoga: 'yoga',
  pilates: 'pilates',
  hiking: 'hiking',
  spin: 'workout',
  barre: 'workout',
  other: 'workout',
};

function nuggieForTimeOfDay(now: Date): NuggieName {
  const hour = now.getHours();
  if (hour >= sleepingStartHour || hour < earlyMorningStartHour) {
    return 'sleeping';
  }
  if (hour < workoutStartHour) {
    return 'earlyMorning';
  }
  return 'workout';
}

function pickCelebrateNuggie(random: () => number): NuggieName {
  const index = Math.min(Math.floor(random() * celebrateNuggies.length), celebrateNuggies.length - 1);
  return celebrateNuggies[index];
}

const nuggieRules: NuggieRules = {
  appLoading: (_moment, now) => nuggieForTimeOfDay(now),
  sessionStarting: (moment) => (moment.startsAt.getHours() < workoutStartHour ? 'earlyMorning' : 'workout'),
  sessionInProgress: 'workout',
  sessionFinished: (moment, _now, random) => {
    if (moment.personalRecordCount > 0) {
      return 'beast';
    }
    if (moment.workoutKind === 'class') {
      return 'goodJob';
    }
    return pickCelebrateNuggie(random);
  },
  classDisplay: (moment) => classTypeNuggies[moment.classType],
  restDay: 'restDay',
  lowSleep: 'tired',
  stepGoalReached: 'hiking',
  weeklyTargetMet: 'goodJob',
  notifications: 'notification',
  analytics: 'analytics',
  coach: 'coach',
};

export function chooseNuggie(moment: NuggieMoment, now: Date, random: () => number = Math.random): NuggieName {
  const rule = nuggieRules[moment.kind] as NuggieRule<NuggieMoment>;
  return typeof rule === 'function' ? rule(moment, now, random) : rule;
}
