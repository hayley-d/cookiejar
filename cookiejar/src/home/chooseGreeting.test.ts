import { describe, expect, test } from 'bun:test';

import { chooseGreeting } from '@/home/chooseGreeting';

const at = (hour: number, minute: number) => new Date(2026, 9, 5, hour, minute);

describe('chooseGreeting', () => {
  test('greets with morning before 12:00', () => {
    expect(chooseGreeting(at(0, 0), 'Hayley')).toBe('Good morning, Hayley');
    expect(chooseGreeting(at(11, 59), 'Hayley')).toBe('Good morning, Hayley');
  });

  test('greets with afternoon from 12:00 until 17:00', () => {
    expect(chooseGreeting(at(12, 0), 'Hayley')).toBe('Good afternoon, Hayley');
    expect(chooseGreeting(at(16, 59), 'Hayley')).toBe('Good afternoon, Hayley');
  });

  test('greets with evening from 17:00', () => {
    expect(chooseGreeting(at(17, 0), 'Hayley')).toBe('Good evening, Hayley');
    expect(chooseGreeting(at(23, 59), 'Hayley')).toBe('Good evening, Hayley');
  });

  test('trims the name', () => {
    expect(chooseGreeting(at(9, 0), '  Hayley  ')).toBe('Good morning, Hayley');
  });

  test('falls back to Hi there for a null, empty or whitespace-only name', () => {
    expect(chooseGreeting(at(9, 0), null)).toBe('Hi there');
    expect(chooseGreeting(at(13, 0), '')).toBe('Hi there');
    expect(chooseGreeting(at(18, 0), '   ')).toBe('Hi there');
  });
});
