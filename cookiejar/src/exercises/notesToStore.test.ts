import { describe, expect, test } from 'bun:test';

import { notesToStore } from '@/exercises/notesToStore';

describe('notesToStore', () => {
  test('keeps a note as written', () => {
    expect(notesToStore('Seat at 4')).toBe('Seat at 4');
  });

  test('trims surrounding whitespace', () => {
    expect(notesToStore('  Seat at 4 \n')).toBe('Seat at 4');
  });

  test('turns an empty note into null', () => {
    expect(notesToStore('')).toBeNull();
  });

  test('turns a whitespace-only note into null', () => {
    expect(notesToStore('  \n\t ')).toBeNull();
  });

  test('keeps inner line breaks', () => {
    expect(notesToStore('Seat at 4\n\nGrip wide')).toBe('Seat at 4\n\nGrip wide');
  });
});
