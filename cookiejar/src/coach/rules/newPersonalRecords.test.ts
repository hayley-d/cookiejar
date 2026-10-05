import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { newPersonalRecords, newPersonalRecordsPriority } from '@/coach/rules/newPersonalRecords';
import type { PersonalRecordEvent } from '@/progress/listPersonalRecordsFromHistory';
import type { Exercise } from '@/types/Exercise';

function createExercise(id: number, name: string): Exercise {
  return {
    id,
    name,
    bodyPart: 'chest',
    imageUrl: null,
    defaultTrackingType: 'repetitions_and_weight',
    createdAt: '',
  };
}

function createRecordEvent(sessionId: number, exerciseId: number, weightKilograms: number): PersonalRecordEvent {
  return {
    sessionId,
    startedAt: new Date(2026, 9, sessionId, 18, 0).toISOString(),
    record: {
      exerciseId,
      recordType: 'heaviestWeight',
      set: {
        exerciseId,
        trackingType: 'repetitions_and_weight',
        repetitions: 8,
        weightKilograms,
        durationSeconds: null,
        distanceMeters: null,
      },
    },
  };
}

const exercisesById = new Map([
  [1, createExercise(1, 'Bench Press')],
  [2, createExercise(2, 'Squat')],
  [3, createExercise(3, 'Deadlift')],
  [4, createExercise(4, 'Row')],
]);

describe('newPersonalRecords', () => {
  test('does not fire without a recent record', () => {
    expect(newPersonalRecords(createCoachSnapshot({ exercisesById }))).toEqual([]);
  });

  test('fires with the beast nuggie, the progress topic and a button to the exercise history', () => {
    const insights = newPersonalRecords(
      createCoachSnapshot({
        exercisesById,
        personalRecordsLastFourteenDays: [createRecordEvent(5, 1, 62.5)],
      }),
    );
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'newPersonalRecords',
      topics: ['progress'],
      priority: newPersonalRecordsPriority,
      nuggie: 'beast',
      action: {
        label: 'See Bench Press history',
        destination: { screen: 'exerciseHistory', exerciseId: 1 },
      },
    });
    expect(insights[0].messages).toHaveLength(1);
    expect(insights[0].messages[0]).toBe('New record on Bench Press! 62.5 kg × 8 (est. 1RM 79 kg)! very noopy 🤥👈🦄');
    expect(newPersonalRecordsPriority).toBe(80);
  });

  test('lists exactly three records when there are three', () => {
    const [insight] = newPersonalRecords(
      createCoachSnapshot({
        exercisesById,
        personalRecordsLastFourteenDays: [
          createRecordEvent(2, 1, 60),
          createRecordEvent(3, 2, 100),
          createRecordEvent(4, 3, 120),
        ],
      }),
    );
    expect(insight.messages).toHaveLength(3);
  });

  test('lists only the three most recent records when there are four', () => {
    const [insight] = newPersonalRecords(
      createCoachSnapshot({
        exercisesById,
        personalRecordsLastFourteenDays: [
          createRecordEvent(2, 1, 60),
          createRecordEvent(3, 2, 100),
          createRecordEvent(4, 3, 120),
          createRecordEvent(5, 4, 70),
        ],
      }),
    );
    expect(insight.messages).toHaveLength(3);
    expect(insight.messages[0]).toContain('Row');
    expect(insight.messages.join(' ')).not.toContain('Bench Press');
    expect(insight.action?.destination).toEqual({
      screen: 'exerciseHistory',
      exerciseId: 4,
    });
  });

  test('lists an exercise once, using its newest record', () => {
    const [insight] = newPersonalRecords(
      createCoachSnapshot({
        exercisesById,
        personalRecordsLastFourteenDays: [
          createRecordEvent(2, 1, 60),
          createRecordEvent(6, 1, 65),
          createRecordEvent(4, 2, 100),
        ],
      }),
    );
    expect(insight.messages).toHaveLength(2);
    expect(insight.messages[0]).toStartWith('New record on Bench Press! 65 kg');
    expect(insight.messages[1]).toContain('Squat');
  });

  test('skips records whose exercise is unknown', () => {
    expect(
      newPersonalRecords(
        createCoachSnapshot({
          exercisesById,
          personalRecordsLastFourteenDays: [createRecordEvent(5, 99, 60)],
        }),
      ),
    ).toEqual([]);
  });
});
