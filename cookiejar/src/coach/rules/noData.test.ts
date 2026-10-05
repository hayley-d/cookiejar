import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { allTopics } from '@/coach/Topic';
import { minimumFinishedSessions, noData, noDataPriority } from '@/coach/rules/noData';

describe('noData', () => {
  test('fires with no finished sessions', () => {
    const [insight] = noData(createCoachSnapshot({ finishedSessionCount: 0 }));
    expect(insight.ruleIdentifier).toBe('noData');
    expect(insight.priority).toBe(noDataPriority);
    expect(insight.priority).toBe(100);
    expect(insight.nuggie).toBe('coach');
    expect(insight.topics).toEqual(allTopics);
    expect(insight.action).toBeNull();
    expect(insight.messages[0]).toBe("Finish a few workouts and I'll start spotting trends!");
  });

  test('fires just below the threshold and counts what is left', () => {
    const insights = noData(createCoachSnapshot({ finishedSessionCount: minimumFinishedSessions - 1 }));
    expect(insights).toHaveLength(1);
    expect(insights[0].messages[1]).toBe('2 down, 1 to go.');
  });

  test('does not fire at the threshold of 3 finished sessions', () => {
    expect(minimumFinishedSessions).toBe(3);
    expect(noData(createCoachSnapshot({ finishedSessionCount: 3 }))).toEqual([]);
  });

  test('does not fire above the threshold', () => {
    expect(noData(createCoachSnapshot({ finishedSessionCount: 40 }))).toEqual([]);
  });
});
