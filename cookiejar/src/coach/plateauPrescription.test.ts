import { describe, expect, test } from 'bun:test';

import { describeBestSet, describePlateauAdvice, loadForRepetitions, type PlateauSituation } from '@/coach/plateauPrescription';
import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { FitnessGoal } from '@/types/Profile';

function weightedSet(weightKilograms: number, repetitions: number): CompletedSet {
  return {
    exerciseId: 1,
    trackingType: 'repetitions_and_weight',
    repetitions,
    weightKilograms,
    durationSeconds: null,
    distanceMeters: null,
  };
}

function situation(
  goal: FitnessGoal | null,
  bestSet: CompletedSet,
  averageSetCount: number,
  averageRepetitions: number,
): PlateauSituation {
  return { exerciseName: 'Squat', goal, bestSet, averageSetCount, averageRepetitions };
}

describe('loadForRepetitions', () => {
  test('converts the best estimated 1RM to the target reps with 2 reps in reserve, rounded down to 2.5 kg', () => {
    expect(loadForRepetitions(weightedSet(100, 5), 6)).toBe(90);
    expect(loadForRepetitions(weightedSet(100, 5), 8)).toBe(87.5);
  });

  test('keeps an extra rep in reserve when the best set was over 10 reps', () => {
    expect(loadForRepetitions(weightedSet(60, 12), 6)).toBe(62.5);
  });

  test('rounds light loads down to 1 kg', () => {
    expect(loadForRepetitions(weightedSet(20, 5), 8)).toBe(17);
  });
});

describe('describePlateauAdvice for strength', () => {
  test('13 or more reps drops to 4×8–10 heavier', () => {
    expect(describePlateauAdvice(situation('strength', weightedSet(40, 15), 4, 15))).toBe(
      'Add weight and drop to 4×8–10 at 42.5 kg for your Squat. 4×15 has done its job!',
    );
  });

  test('10 to 12 reps goes heavier with 4×6–8', () => {
    expect(describePlateauAdvice(situation('strength', weightedSet(60, 12), 4, 12))).toBe(
      'I think you can go heavier with 4×6–8 at 62.5 kg for your Squat.',
    );
  });

  test('7 to 9 reps goes heavier with 4×4–6', () => {
    expect(describePlateauAdvice(situation('strength', weightedSet(80, 8), 3, 8))).toBe(
      'I think you can go heavier with 4×4–6 at 82.5 kg for your Squat.',
    );
  });

  test('6 or fewer reps keeps the heavy day and adds a moderate day', () => {
    expect(describePlateauAdvice(situation('strength', weightedSet(100, 5), 5, 5))).toBe(
      'I believe in you! Keep your heavy 5×5 day and add a lighter 3×8–10 day at 87.5 kg for a few weeks.',
    );
  });
});

describe('describePlateauAdvice for muscle, general fitness and no goal', () => {
  test('5 or fewer reps moves up to 4×8–12', () => {
    for (const goal of ['hypertrophy', 'general_fitness', null] as const) {
      expect(describePlateauAdvice(situation(goal, weightedSet(100, 5), 5, 5))).toBe(
        'I believe in you! Try 4×8–12 at 87.5 kg for a few weeks, each set 1–2 reps from failure.',
      );
    }
  });

  test('otherwise keeps the reps and adds a set', () => {
    expect(describePlateauAdvice(situation('hypertrophy', weightedSet(60, 10), 3, 10))).toBe(
      'Keep your 10 reps and add a set: 4×10, each set 1–2 reps from failure.',
    );
  });
});

describe('describePlateauAdvice for endurance and weight loss', () => {
  test('endurance at 15 reps or fewer goes lighter and longer', () => {
    expect(describePlateauAdvice(situation('endurance', weightedSet(60, 10), 3, 10))).toBe(
      'Go lighter and longer: 3×15–20 at 50 kg for your Squat.',
    );
  });

  test('endurance over 15 reps adds a set or cuts rest', () => {
    expect(describePlateauAdvice(situation('endurance', weightedSet(30, 20), 3, 20))).toBe(
      'Add a set (4×20) or cut 15 seconds of rest between sets.',
    );
  });

  test('weight loss holds the weight and adds a rep per set', () => {
    expect(describePlateauAdvice(situation('weight_loss', weightedSet(60, 10), 3, 10))).toBe(
      "Keep 60 kg and add 1 rep per set (3×11) before adding weight. Stalls are normal in a calorie deficit, you're doing great!",
    );
  });
});

describe('describePlateauAdvice without weights', () => {
  const repetitionSet: CompletedSet = { ...weightedSet(0, 8), trackingType: 'repetitions', weightKilograms: null };

  test('bodyweight under 15 reps adds a rep per set', () => {
    expect(describePlateauAdvice(situation('strength', repetitionSet, 3, 8))).toBe(
      'Add 1 rep per set each week: 3×9 next. A slow 3-second lowering makes each rep count too.',
    );
  });

  test('bodyweight at 15 reps or more adds load', () => {
    expect(describePlateauAdvice(situation(null, { ...repetitionSet, repetitions: 20 }, 3, 20))).toBe(
      "You've outgrown bodyweight Squat. Add a weight or a harder version and aim for 3×8–12.",
    );
  });

  test('timed holds split into shorter holds', () => {
    const holdSet: CompletedSet = { ...repetitionSet, trackingType: 'duration', repetitions: null, durationSeconds: 90 };
    expect(describePlateauAdvice(situation(null, holdSet, 1, 0))).toBe(
      'Split it up: 4 × 55s, adding 5 seconds a week, then retest your 1m 30s hold.',
    );
  });

  test('distance builds by about 10% plus intervals', () => {
    const distanceSet: CompletedSet = {
      ...repetitionSet,
      trackingType: 'distance',
      repetitions: null,
      distanceMeters: 2400,
    };
    expect(describePlateauAdvice(situation(null, distanceSet, 1, 0))).toBe(
      'Build slowly: 2.6 km next time, plus 4 × 800 m a bit faster once a week.',
    );
  });
});

describe('describeBestSet', () => {
  test('shows the set by tracking type', () => {
    expect(describeBestSet(weightedSet(100, 5))).toBe('100 kg × 5');
    expect(
      describeBestSet({ ...weightedSet(0, 8), trackingType: 'repetitions', weightKilograms: null }),
    ).toBe('8 reps');
  });
});
