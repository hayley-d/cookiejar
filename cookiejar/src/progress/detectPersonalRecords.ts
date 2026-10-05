import type { TrackingType } from '@/types/TrackingType';

export type CompletedSet = {
  exerciseId: number;
  trackingType: TrackingType;
  repetitions: number | null;
  weightKilograms: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export type PersonalRecordType =
  | 'heaviestWeight'
  | 'bestEstimatedOneRepMax'
  | 'mostRepetitionsAtWeight'
  | 'mostRepetitions'
  | 'longestDuration'
  | 'longestDistance';

export type PersonalRecord = {
  exerciseId: number;
  recordType: PersonalRecordType;
  set: CompletedSet;
};

export const personalRecordPriority: readonly PersonalRecordType[] = [
  'heaviestWeight',
  'bestEstimatedOneRepMax',
  'mostRepetitionsAtWeight',
  'mostRepetitions',
  'longestDuration',
  'longestDistance',
];

const maximumRepetitionsForOneRepMaxEstimate = 12;
const epleyRepetitionsDivisor = 30;

export function estimateOneRepMax(weightKilograms: number, repetitions: number): number {
  return weightKilograms * (1 + repetitions / epleyRepetitionsDivisor);
}

type WeightedSet = CompletedSet & { repetitions: number; weightKilograms: number };

function isWeightedSet(set: CompletedSet): set is WeightedSet {
  return (
    set.trackingType === 'repetitions_and_weight' &&
    set.repetitions !== null &&
    set.repetitions >= 1 &&
    set.weightKilograms !== null
  );
}

function estimateOf(set: WeightedSet): number | null {
  return set.repetitions <= maximumRepetitionsForOneRepMaxEstimate
    ? estimateOneRepMax(set.weightKilograms, set.repetitions)
    : null;
}

function bestBy<Item>(items: readonly Item[], compare: (candidate: Item, current: Item) => boolean): Item | null {
  let best: Item | null = null;
  for (const item of items) {
    if (best === null || compare(item, best)) {
      best = item;
    }
  }
  return best;
}

function isGreater(candidate: number | null, current: number | null): boolean {
  return candidate !== null && (current === null || candidate > current);
}

function maximumOf(values: readonly (number | null)[]): number | null {
  return values.reduce<number | null>((maximum, value) => (isGreater(value, maximum) ? value : maximum), null);
}

function detectWeightedRecords(currentSets: readonly CompletedSet[], earlierSets: readonly CompletedSet[]) {
  const records: { recordType: PersonalRecordType; set: CompletedSet }[] = [];
  const currentWeighted = currentSets.filter(isWeightedSet);
  const earlierWeighted = earlierSets.filter(isWeightedSet);

  const heaviestCurrent = bestBy(currentWeighted, (candidate, current) =>
    candidate.weightKilograms !== current.weightKilograms
      ? candidate.weightKilograms > current.weightKilograms
      : candidate.repetitions > current.repetitions,
  );
  const heaviestEarlier = maximumOf(earlierWeighted.map((set) => set.weightKilograms));
  if (
    heaviestCurrent !== null &&
    heaviestEarlier !== null &&
    heaviestCurrent.weightKilograms > heaviestEarlier
  ) {
    records.push({ recordType: 'heaviestWeight', set: heaviestCurrent });
  }

  const bestEstimateCurrent = bestBy(
    currentWeighted.filter((set) => estimateOf(set) !== null),
    (candidate, current) => (estimateOf(candidate) as number) > (estimateOf(current) as number),
  );
  const bestEstimateEarlier = maximumOf(earlierWeighted.map(estimateOf));
  if (
    bestEstimateCurrent !== null &&
    bestEstimateEarlier !== null &&
    (estimateOf(bestEstimateCurrent) as number) > bestEstimateEarlier
  ) {
    records.push({ recordType: 'bestEstimatedOneRepMax', set: bestEstimateCurrent });
  }

  const repetitionRecordSets = currentWeighted.filter((set) => {
    const earlierAtOrAboveWeight = earlierWeighted.filter(
      (earlierSet) => earlierSet.weightKilograms >= set.weightKilograms,
    );
    const mostEarlierRepetitions = maximumOf(earlierAtOrAboveWeight.map((earlierSet) => earlierSet.repetitions));
    return mostEarlierRepetitions !== null && set.repetitions > mostEarlierRepetitions;
  });
  const bestRepetitionRecord = bestBy(repetitionRecordSets, (candidate, current) =>
    candidate.repetitions !== current.repetitions
      ? candidate.repetitions > current.repetitions
      : candidate.weightKilograms > current.weightKilograms,
  );
  if (bestRepetitionRecord !== null) {
    records.push({ recordType: 'mostRepetitionsAtWeight', set: bestRepetitionRecord });
  }

  return records;
}

function detectSingleValueRecord(
  recordType: PersonalRecordType,
  trackingType: TrackingType,
  readValue: (set: CompletedSet) => number | null,
  currentSets: readonly CompletedSet[],
  earlierSets: readonly CompletedSet[],
) {
  const currentCandidates = currentSets.filter((set) => set.trackingType === trackingType);
  const bestCurrent = bestBy(currentCandidates, (candidate, current) => isGreater(readValue(candidate), readValue(current)));
  const bestEarlier = maximumOf(
    earlierSets.filter((set) => set.trackingType === trackingType).map(readValue),
  );
  if (bestCurrent === null || bestEarlier === null || !isGreater(readValue(bestCurrent), bestEarlier)) {
    return [];
  }
  return [{ recordType, set: bestCurrent }];
}

export function detectPersonalRecords(
  currentSets: readonly CompletedSet[],
  earlierSets: readonly CompletedSet[],
): PersonalRecord[] {
  const exerciseIds = [...new Set(currentSets.map((set) => set.exerciseId))];
  return exerciseIds.flatMap((exerciseId) => {
    const currentForExercise = currentSets.filter((set) => set.exerciseId === exerciseId);
    const earlierForExercise = earlierSets.filter((set) => set.exerciseId === exerciseId);
    if (earlierForExercise.length === 0) {
      return [];
    }
    return [
      ...detectWeightedRecords(currentForExercise, earlierForExercise),
      ...detectSingleValueRecord(
        'mostRepetitions',
        'repetitions',
        (set) => set.repetitions,
        currentForExercise,
        earlierForExercise,
      ),
      ...detectSingleValueRecord(
        'longestDuration',
        'duration',
        (set) => set.durationSeconds,
        currentForExercise,
        earlierForExercise,
      ),
      ...detectSingleValueRecord(
        'longestDistance',
        'distance',
        (set) => set.distanceMeters,
        currentForExercise,
        earlierForExercise,
      ),
    ].map((record) => ({ exerciseId, ...record }));
  });
}

export function selectBestRecordPerExercise(records: readonly PersonalRecord[]): PersonalRecord[] {
  const exerciseIds = [...new Set(records.map((record) => record.exerciseId))];
  return exerciseIds.map((exerciseId) => {
    const exerciseRecords = records.filter((record) => record.exerciseId === exerciseId);
    return exerciseRecords.reduce((best, record) =>
      personalRecordPriority.indexOf(record.recordType) < personalRecordPriority.indexOf(best.recordType)
        ? record
        : best,
    );
  });
}

export function countExercisesWithRecords(records: readonly PersonalRecord[]): number {
  return new Set(records.map((record) => record.exerciseId)).size;
}
