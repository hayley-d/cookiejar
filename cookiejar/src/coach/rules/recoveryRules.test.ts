import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { elevatedRestingHeartRate, elevatedRestingHeartRatePriority } from '@/coach/rules/elevatedRestingHeartRate';
import { lowSleep, lowSleepPriority } from '@/coach/rules/lowSleep';
import { recoveryGood, recoveryGoodPriority } from '@/coach/rules/recoveryGood';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

type HealthDay = {
  date: string;
  sleepMinutes?: number | null;
  restingHeartRate?: number | null;
};

function healthSnapshots(days: HealthDay[]): HealthSnapshot[] {
  return days.map((day) => ({
    date: day.date,
    steps: 0,
    sleepMinutes: day.sleepMinutes ?? null,
    restingHeartRate: day.restingHeartRate ?? null,
    fetchedAt: '2026-10-07T09:00:00.000Z',
  }));
}

function snapshotWith(days: HealthDay[]) {
  return createCoachSnapshot({ healthLastFourteenDays: healthSnapshots(days) });
}

function sleepOnlyLastNight(sleepMinutes: number | null) {
  return snapshotWith([{ date: '2026-10-07', sleepMinutes }]);
}

function threeNights(lastNight: number, previousNight: number, nightBefore: number) {
  return snapshotWith([
    { date: '2026-10-07', sleepMinutes: lastNight },
    { date: '2026-10-06', sleepMinutes: previousNight },
    { date: '2026-10-05', sleepMinutes: nightBefore },
  ]);
}

const previousDates = [
  '2026-10-06',
  '2026-10-05',
  '2026-10-04',
  '2026-10-03',
  '2026-10-02',
  '2026-10-01',
  '2026-09-30',
];

function heartRateWeek(todayValue: number | null, baseline: number, sleepMinutes: number | null = null) {
  return snapshotWith([
    { date: '2026-10-07', restingHeartRate: todayValue, sleepMinutes },
    ...previousDates.map((date) => ({ date, restingHeartRate: baseline })),
  ]);
}

describe('lowSleep', () => {
  test('fires for a short night with the tired nuggie, formatted duration and calendar action', () => {
    const insights = lowSleep(sleepOnlyLastNight(340));
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'lowSleep',
      topics: ['recovery'],
      priority: lowSleepPriority,
      nuggie: 'tired',
      action: { destination: { screen: 'calendar' } },
    });
    expect(insights[0].messages[0]).toContain('5h 40m');
    expect(lowSleepPriority).toBe(90);
  });

  test('359 minutes fires and 360 does not', () => {
    expect(lowSleep(threeNights(359, 450, 450))).toHaveLength(1);
    expect(lowSleep(threeNights(360, 450, 450))).toEqual([]);
  });

  test('a three night average of exactly 390 does not fire and just under does', () => {
    expect(lowSleep(threeNights(390, 390, 390))).toEqual([]);
    expect(lowSleep(threeNights(360, 390, 420))).toEqual([]);
    expect(lowSleep(threeNights(361, 390, 419))).toEqual([]);
    expect(lowSleep(threeNights(361, 389, 419))).toHaveLength(1);
  });

  test('fires on the average alone when last night was fine and names the average', () => {
    const insights = lowSleep(threeNights(370, 370, 370));
    expect(insights).toHaveLength(1);
    expect(insights[0].messages[0]).toContain('6h 10m');
  });

  test('emits a single insight when both conditions hold', () => {
    expect(lowSleep(threeNights(300, 300, 300))).toHaveLength(1);
  });

  test('skips nights without a value in the average', () => {
    const snapshot = snapshotWith([
      { date: '2026-10-07', sleepMinutes: null },
      { date: '2026-10-06', sleepMinutes: 380 },
      { date: '2026-10-05', sleepMinutes: null },
    ]);
    expect(lowSleep(snapshot)).toHaveLength(1);
  });

  test('ignores nights older than three nights', () => {
    const snapshot = snapshotWith([
      { date: '2026-10-07', sleepMinutes: 450 },
      { date: '2026-10-06', sleepMinutes: 450 },
      { date: '2026-10-05', sleepMinutes: 450 },
      { date: '2026-10-04', sleepMinutes: 100 },
    ]);
    expect(lowSleep(snapshot)).toEqual([]);
  });

  test('never fires without data', () => {
    expect(lowSleep(createCoachSnapshot())).toEqual([]);
    expect(lowSleep(sleepOnlyLastNight(null))).toEqual([]);
  });
});

describe('elevatedRestingHeartRate', () => {
  test('fires at plus 5 bpm with the tired nuggie and the difference', () => {
    const insights = elevatedRestingHeartRate(heartRateWeek(60, 55));
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'elevatedRestingHeartRate',
      topics: ['recovery'],
      priority: elevatedRestingHeartRatePriority,
      nuggie: 'tired',
      action: null,
    });
    expect(insights[0].messages[0]).toContain('5 bpm');
    expect(elevatedRestingHeartRatePriority).toBe(85);
  });

  test('plus 4 bpm does not fire', () => {
    expect(elevatedRestingHeartRate(heartRateWeek(59, 55))).toEqual([]);
  });

  test('excludes today from the average and skips days without a value', () => {
    const snapshot = snapshotWith([
      { date: '2026-10-07', restingHeartRate: 60 },
      { date: '2026-10-06', restingHeartRate: 55 },
      { date: '2026-10-05', restingHeartRate: null },
      { date: '2026-10-04', restingHeartRate: 55 },
    ]);
    expect(elevatedRestingHeartRate(snapshot)).toHaveLength(1);
  });

  test('ignores days older than seven days before today', () => {
    const snapshot = snapshotWith([
      { date: '2026-10-07', restingHeartRate: 60 },
      { date: '2026-10-06', restingHeartRate: 58 },
      { date: '2026-09-29', restingHeartRate: 40 },
    ]);
    expect(elevatedRestingHeartRate(snapshot)).toEqual([]);
  });

  test('never fires with missing data', () => {
    expect(elevatedRestingHeartRate(createCoachSnapshot())).toEqual([]);
    expect(elevatedRestingHeartRate(heartRateWeek(null, 55))).toEqual([]);
    expect(elevatedRestingHeartRate(snapshotWith([{ date: '2026-10-07', restingHeartRate: 70 }]))).toEqual([]);
  });
});

describe('recoveryGood', () => {
  test('fires with the beast nuggie at 420 minutes with resting heart rate equal to the average', () => {
    const insights = recoveryGood(heartRateWeek(55, 55, 420));
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'recoveryGood',
      topics: ['recovery'],
      priority: recoveryGoodPriority,
      nuggie: 'beast',
      action: null,
    });
    expect(recoveryGoodPriority).toBe(35);
  });

  test('fires with resting heart rate below the average', () => {
    expect(recoveryGood(heartRateWeek(50, 55, 480))).toHaveLength(1);
  });

  test('419 minutes does not fire', () => {
    expect(recoveryGood(heartRateWeek(55, 55, 419))).toEqual([]);
  });

  test('resting heart rate one above the average does not fire', () => {
    expect(recoveryGood(heartRateWeek(56, 55, 480))).toEqual([]);
  });

  test('never fires with missing data', () => {
    expect(recoveryGood(createCoachSnapshot())).toEqual([]);
    expect(recoveryGood(heartRateWeek(55, 55, null))).toEqual([]);
    expect(recoveryGood(heartRateWeek(null, 55, 480))).toEqual([]);
    expect(recoveryGood(snapshotWith([{ date: '2026-10-07', sleepMinutes: 480, restingHeartRate: 50 }]))).toEqual([]);
  });
});
