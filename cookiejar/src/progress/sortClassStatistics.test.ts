import { describe, expect, test } from 'bun:test';

import { sortClassStatistics } from '@/progress/sortClassStatistics';
import type { ClassStatistics } from '@/types/ClassStatistics';
import type { ClassType } from '@/types/ClassType';

function statistics(classType: ClassType, sessionCount: number): ClassStatistics {
  return { classType, sessionCount, totalSeconds: 0, sessionsThisMonth: 0, lastStartedAt: '2026-10-01T08:00:00.000Z' };
}

describe('sortClassStatistics', () => {
  test('orders by session count descending', () => {
    const sorted = sortClassStatistics([statistics('yoga', 2), statistics('spin', 5), statistics('barre', 3)]);
    expect(sorted.map((entry) => entry.classType)).toEqual(['spin', 'barre', 'yoga']);
  });

  test('breaks ties by class name', () => {
    const sorted = sortClassStatistics([statistics('yoga', 4), statistics('barre', 4), statistics('pilates', 4)]);
    expect(sorted.map((entry) => entry.classType)).toEqual(['barre', 'pilates', 'yoga']);
  });

  test('does not change the input', () => {
    const input = [statistics('yoga', 1), statistics('spin', 2)];
    sortClassStatistics(input);
    expect(input.map((entry) => entry.classType)).toEqual(['yoga', 'spin']);
  });
});
