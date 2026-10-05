import { formatDuration } from '@/dates/formatDuration';
import { estimateOneRepMax, type CompletedSet } from '@/progress/detectPersonalRecords';
import type { FitnessGoal } from '@/types/Profile';
import { formatDistance } from '@/workouts/describeTargetSets';

export type PlateauSituation = {
  exerciseName: string;
  goal: FitnessGoal | null;
  bestSet: CompletedSet;
  averageSetCount: number;
  averageRepetitions: number;
};

const epleyRepetitionsDivisor = 30;
const repetitionsInReserve = 2;
const highRepetitionEstimateThreshold = 10;
const lightLoadKilograms = 20;
const lightLoadIncrementKilograms = 1;
const loadIncrementKilograms = 2.5;
const bodyweightOutgrownRepetitions = 15;
const holdFraction = 0.6;
const holdIncrementSeconds = 5;
const distanceIncreaseFactor = 1.1;
const distanceIncrementMeters = 100;

export function describeBestSet(set: CompletedSet): string {
  switch (set.trackingType) {
    case 'repetitions_and_weight':
      return `${set.weightKilograms ?? 0} kg × ${set.repetitions ?? 0}`;
    case 'repetitions':
      return `${set.repetitions ?? 0} reps`;
    case 'duration':
      return formatDuration(set.durationSeconds ?? 0);
    case 'distance':
      return formatDistance(set.distanceMeters ?? 0);
  }
}

export function loadForRepetitions(bestSet: CompletedSet, targetRepetitions: number): number {
  const weightKilograms = bestSet.weightKilograms ?? 0;
  const bestRepetitions = bestSet.repetitions ?? 0;
  const reserve =
    bestRepetitions > highRepetitionEstimateThreshold ? repetitionsInReserve + 1 : repetitionsInReserve;
  const load =
    estimateOneRepMax(weightKilograms, bestRepetitions) / (1 + (targetRepetitions + reserve) / epleyRepetitionsDivisor);
  const increment = load < lightLoadKilograms ? lightLoadIncrementKilograms : loadIncrementKilograms;
  return Math.floor(load / increment) * increment;
}

function atLoad(bestSet: CompletedSet, targetRepetitions: number): string {
  const load = loadForRepetitions(bestSet, targetRepetitions);
  return load > 0 ? ` at ${load} kg` : '';
}

function strengthAdvice(situation: PlateauSituation): string {
  const { averageSetCount, averageRepetitions, bestSet, exerciseName } = situation;
  if (averageRepetitions >= 13) {
    return `Add weight and drop to 4×8–10${atLoad(bestSet, 8)} for your ${exerciseName}. ${averageSetCount}×${averageRepetitions} has done its job!`;
  }
  if (averageRepetitions >= 10) {
    return `I think you can go heavier with 4×6–8${atLoad(bestSet, 6)} for your ${exerciseName}.`;
  }
  if (averageRepetitions >= 7) {
    return `I think you can go heavier with 4×4–6${atLoad(bestSet, 4)} for your ${exerciseName}.`;
  }
  return `I believe in you! Keep your heavy ${averageSetCount}×${averageRepetitions} day and add a lighter 3×8–10 day${atLoad(bestSet, 8)} for a few weeks.`;
}

function muscleAdvice(situation: PlateauSituation): string {
  const { averageSetCount, averageRepetitions, bestSet } = situation;
  if (averageRepetitions <= 5) {
    return `I believe in you! Try 4×8–12${atLoad(bestSet, 8)} for a few weeks, each set 1–2 reps from failure.`;
  }
  return `Keep your ${averageRepetitions} reps and add a set: ${averageSetCount + 1}×${averageRepetitions}, each set 1–2 reps from failure.`;
}

function enduranceAdvice(situation: PlateauSituation): string {
  const { averageSetCount, averageRepetitions, bestSet, exerciseName } = situation;
  if (averageRepetitions <= 15) {
    return `Go lighter and longer: 3×15–20${atLoad(bestSet, 15)} for your ${exerciseName}.`;
  }
  return `Add a set (${averageSetCount + 1}×${averageRepetitions}) or cut 15 seconds of rest between sets.`;
}

function weightLossAdvice(situation: PlateauSituation): string {
  const { averageSetCount, averageRepetitions, bestSet } = situation;
  return `Keep ${bestSet.weightKilograms ?? 0} kg and add 1 rep per set (${averageSetCount}×${averageRepetitions + 1}) before adding weight. Stalls are normal in a calorie deficit, you're doing great!`;
}

function weightedAdvice(situation: PlateauSituation): string {
  switch (situation.goal) {
    case 'strength':
      return strengthAdvice(situation);
    case 'endurance':
      return enduranceAdvice(situation);
    case 'weight_loss':
      return weightLossAdvice(situation);
    case 'hypertrophy':
    case 'general_fitness':
    case null:
      return muscleAdvice(situation);
  }
}

function bodyweightAdvice(situation: PlateauSituation): string {
  const { averageSetCount, averageRepetitions, exerciseName } = situation;
  if (averageRepetitions >= bodyweightOutgrownRepetitions) {
    return `You've outgrown bodyweight ${exerciseName}. Add a weight or a harder version and aim for 3×8–12.`;
  }
  return `Add 1 rep per set each week: ${averageSetCount}×${averageRepetitions + 1} next. A slow 3-second lowering makes each rep count too.`;
}

function holdAdvice(bestSet: CompletedSet): string {
  const bestSeconds = bestSet.durationSeconds ?? 0;
  const holdSeconds = Math.max(
    holdIncrementSeconds,
    Math.round((bestSeconds * holdFraction) / holdIncrementSeconds) * holdIncrementSeconds,
  );
  return `Split it up: 4 × ${formatDuration(holdSeconds)}, adding 5 seconds a week, then retest your ${formatDuration(bestSeconds)} hold.`;
}

function distanceAdvice(bestSet: CompletedSet): string {
  const nextMeters =
    Math.round(((bestSet.distanceMeters ?? 0) * distanceIncreaseFactor) / distanceIncrementMeters) *
    distanceIncrementMeters;
  return `Build slowly: ${formatDistance(nextMeters)} next time, plus 4 × 800 m a bit faster once a week.`;
}

export function describePlateauAdvice(situation: PlateauSituation): string {
  switch (situation.bestSet.trackingType) {
    case 'repetitions_and_weight':
      return weightedAdvice(situation);
    case 'repetitions':
      return bodyweightAdvice(situation);
    case 'duration':
      return holdAdvice(situation.bestSet);
    case 'distance':
      return distanceAdvice(situation.bestSet);
  }
}
