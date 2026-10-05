import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { NuggieName } from '@/nuggies/NuggieName';
import type { ClassType } from '@/types/ClassType';
import type { WorkoutKind } from '@/types/WorkoutKind';

export type FinishingPresentationInput = {
  workoutKind: WorkoutKind;
  classType: ClassType | null;
  personalRecordCount: number;
};

export type FinishingPresentation = {
  nuggie: NuggieName;
  caption: string;
};

const sessionIdMultiplier = 2654435761;
const seedIncrement = 0x6d2b79f5;
const uint32Range = 4294967296;

export function randomFromSessionId(sessionId: number): () => number {
  let state = (Math.imul(sessionId, sessionIdMultiplier) >>> 0) + seedIncrement;
  return () => {
    state = (state + seedIncrement) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / uint32Range;
  };
}

export function describeFinishingCaption(input: FinishingPresentationInput): string {
  if (input.personalRecordCount > 0) {
    return 'New personal record!';
  }
  if (input.workoutKind === 'individual') {
    return 'Workout complete!';
  }
  return input.classType === 'yoga' ? 'Namaste — class complete!' : 'Class complete!';
}

export function chooseFinishingPresentation(
  input: FinishingPresentationInput,
  random: () => number = Math.random,
): FinishingPresentation {
  return {
    nuggie: chooseNuggie(
      { kind: 'sessionFinished', workoutKind: input.workoutKind, personalRecordCount: input.personalRecordCount },
      new Date(),
      random,
    ),
    caption: describeFinishingCaption(input),
  };
}

export function chooseStableFinishingPresentation(
  sessionId: number,
  input: FinishingPresentationInput,
): FinishingPresentation {
  return chooseFinishingPresentation(input, randomFromSessionId(sessionId));
}
