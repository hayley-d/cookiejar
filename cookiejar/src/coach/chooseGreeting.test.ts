import { describe, expect, test } from 'bun:test';

import { chooseGreeting } from '@/coach/chooseGreeting';

const at = (hour: number, minute: number) => new Date(2026, 9, 5, hour, minute);

describe('chooseGreeting', () => {
  test('says morning before 12:00', () => {
    expect(chooseGreeting(at(0, 0), 'Hayley')).toBe('Morning Hayley!');
    expect(chooseGreeting(at(11, 59), 'Hayley')).toBe('Morning Hayley!');
  });

  test('says afternoon from 12:00 until 17:00', () => {
    expect(chooseGreeting(at(12, 0), 'Hayley')).toBe('Afternoon Hayley!');
    expect(chooseGreeting(at(16, 59), 'Hayley')).toBe('Afternoon Hayley!');
  });

  test('says evening from 17:00', () => {
    expect(chooseGreeting(at(17, 0), 'Hayley')).toBe('Evening Hayley!');
    expect(chooseGreeting(at(23, 59), 'Hayley')).toBe('Evening Hayley!');
  });

  test('trims the name', () => {
    expect(chooseGreeting(at(9, 0), '  Hayley ')).toBe('Morning Hayley!');
  });

  test('greets without a name when it is null, empty or blank', () => {
    expect(chooseGreeting(at(9, 0), null)).toBe('Morning!');
    expect(chooseGreeting(at(13, 0), '')).toBe('Afternoon!');
    expect(chooseGreeting(at(18, 0), '   ')).toBe('Evening!');
  });
});
