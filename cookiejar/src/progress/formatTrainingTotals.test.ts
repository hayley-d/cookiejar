import { describe, expect, test } from 'bun:test';

import {
  describeLifetimeTotals,
  describeNewRecordCount,
  formatTimeTrained,
  formatVolume,
  formatWholeHoursTrained,
} from '@/progress/formatTrainingTotals';

describe('formatTimeTrained', () => {
  test('shows minutes under an hour', () => {
    expect(formatTimeTrained(0)).toBe('0 min');
    expect(formatTimeTrained(45 * 60 + 59)).toBe('45 min');
  });

  test('shows hours and remaining minutes', () => {
    expect(formatTimeTrained(3600)).toBe('1 h');
    expect(formatTimeTrained(5 * 3600 + 20 * 60)).toBe('5 h 20 min');
  });

  test('treats negative durations as zero', () => {
    expect(formatTimeTrained(-30)).toBe('0 min');
  });
});

describe('formatWholeHoursTrained', () => {
  test('floors to whole hours', () => {
    expect(formatWholeHoursTrained(96 * 3600 + 3000)).toBe('96 h');
  });

  test('shows minutes under an hour', () => {
    expect(formatWholeHoursTrained(1500)).toBe('25 min');
  });
});

describe('formatVolume', () => {
  test('groups thousands and rounds', () => {
    expect(formatVolume(12400)).toBe('12,400 kg');
    expect(formatVolume(1234.6)).toBe('1,235 kg');
    expect(formatVolume(0)).toBe('0 kg');
  });
});

describe('describeNewRecordCount', () => {
  test('pluralises', () => {
    expect(describeNewRecordCount(0)).toBe('🏆 0 new records this month');
    expect(describeNewRecordCount(1)).toBe('🏆 1 new record this month');
    expect(describeNewRecordCount(3)).toBe('🏆 3 new records this month');
  });
});

describe('describeLifetimeTotals', () => {
  test('combines workouts and hours', () => {
    expect(describeLifetimeTotals({ workoutCount: 128, timeTrainedSeconds: 96 * 3600, volumeKilograms: 0 })).toBe(
      '128 workouts · 96 h trained',
    );
    expect(describeLifetimeTotals({ workoutCount: 1, timeTrainedSeconds: 1800, volumeKilograms: 0 })).toBe(
      '1 workout · 30 min trained',
    );
  });
});
