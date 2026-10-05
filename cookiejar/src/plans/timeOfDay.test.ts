import { describe, expect, test } from 'bun:test';

import {
  compareTimeOfDay,
  dateToTimeOfDay,
  defaultTimeOfDayForNewEntry,
  formatTimeOfDay,
  isTimeOfDay,
  minutesToTimeOfDay,
  sortByTimeOfDay,
  timeOfDayToDate,
  timeOfDayToMinutes,
} from '@/plans/timeOfDay';

describe('isTimeOfDay', () => {
  test('accepts 24-hour HH:MM', () => {
    expect(isTimeOfDay('00:00')).toBe(true);
    expect(isTimeOfDay('06:00')).toBe(true);
    expect(isTimeOfDay('23:59')).toBe(true);
  });

  test('rejects anything else', () => {
    expect(isTimeOfDay('6:00')).toBe(false);
    expect(isTimeOfDay('24:00')).toBe(false);
    expect(isTimeOfDay('12:60')).toBe(false);
    expect(isTimeOfDay('noon')).toBe(false);
  });
});

describe('timeOfDayToMinutes and minutesToTimeOfDay', () => {
  test('counts minutes since midnight', () => {
    expect(timeOfDayToMinutes('00:00')).toBe(0);
    expect(timeOfDayToMinutes('17:30')).toBe(1050);
  });

  test('pads hours and minutes', () => {
    expect(minutesToTimeOfDay(65)).toBe('01:05');
  });

  test('throws on malformed text', () => {
    expect(() => timeOfDayToMinutes('7am')).toThrow();
  });
});

describe('timeOfDayToDate', () => {
  test('sets the local time on the given day', () => {
    const date = timeOfDayToDate('17:30', new Date(2026, 9, 5, 9, 15, 42));
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(17);
    expect(date.getMinutes()).toBe(30);
    expect(date.getSeconds()).toBe(0);
  });

  test('round-trips with dateToTimeOfDay', () => {
    expect(dateToTimeOfDay(timeOfDayToDate('06:05', new Date(2026, 0, 1)))).toBe('06:05');
  });
});

describe('dateToTimeOfDay', () => {
  test('drops seconds', () => {
    expect(dateToTimeOfDay(new Date(2026, 9, 5, 6, 0, 59))).toBe('06:00');
  });

  test('uses the local time late in the evening', () => {
    expect(dateToTimeOfDay(new Date(2026, 11, 31, 23, 45))).toBe('23:45');
  });
});

describe('formatTimeOfDay', () => {
  test('shows 24-hour HH:MM', () => {
    expect(formatTimeOfDay('06:00')).toBe('06:00');
    expect(formatTimeOfDay('17:30')).toBe('17:30');
  });
});

describe('compareTimeOfDay and sortByTimeOfDay', () => {
  test('earlier times come first', () => {
    expect(compareTimeOfDay('06:00', '17:30')).toBeLessThan(0);
    expect(compareTimeOfDay('17:30', '06:00')).toBeGreaterThan(0);
    expect(compareTimeOfDay('09:00', '09:00')).toBe(0);
  });

  test('sorts entries by time without changing the input', () => {
    const entries = [
      { name: 'Weights', timeOfDay: '17:30' },
      { name: 'Spin', timeOfDay: '06:00' },
      { name: 'Walk', timeOfDay: '12:15' },
    ];
    expect(sortByTimeOfDay(entries).map((entry) => entry.name)).toEqual(['Spin', 'Walk', 'Weights']);
    expect(entries[0].name).toBe('Weights');
  });

  test('keeps the original order for equal times', () => {
    const entries = [
      { name: 'First', timeOfDay: '07:00' },
      { name: 'Second', timeOfDay: '07:00' },
    ];
    expect(sortByTimeOfDay(entries).map((entry) => entry.name)).toEqual(['First', 'Second']);
  });
});

describe('defaultTimeOfDayForNewEntry', () => {
  test('an empty day starts at 07:00', () => {
    expect(defaultTimeOfDayForNewEntry([])).toBe('07:00');
  });

  test('one hour after the last entry', () => {
    expect(defaultTimeOfDayForNewEntry(['06:00'])).toBe('07:00');
    expect(defaultTimeOfDayForNewEntry(['17:30'])).toBe('18:30');
  });

  test('uses the latest entry whatever the order', () => {
    expect(defaultTimeOfDayForNewEntry(['17:30', '06:00'])).toBe('18:30');
  });

  test('is capped at 23:30 so it never wraps past midnight', () => {
    expect(defaultTimeOfDayForNewEntry(['22:30'])).toBe('23:30');
    expect(defaultTimeOfDayForNewEntry(['23:00'])).toBe('23:30');
    expect(defaultTimeOfDayForNewEntry(['23:45'])).toBe('23:30');
  });
});
