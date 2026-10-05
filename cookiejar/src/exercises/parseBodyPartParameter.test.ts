import { describe, expect, test } from 'bun:test';

import { parseBodyPartParameter } from '@/exercises/parseBodyPartParameter';
import { bodyParts } from '@/types/BodyPart';

describe('parseBodyPartParameter', () => {
  test('accepts every body part', () => {
    for (const bodyPart of bodyParts) {
      expect(parseBodyPartParameter(bodyPart)).toBe(bodyPart);
    }
  });

  test('a missing parameter gives no body part', () => {
    expect(parseBodyPartParameter(undefined)).toBeNull();
  });

  test('an unknown or empty value gives no body part', () => {
    expect(parseBodyPartParameter('legs')).toBeNull();
    expect(parseBodyPartParameter('')).toBeNull();
    expect(parseBodyPartParameter('Chest')).toBeNull();
  });

  test('a repeated parameter gives no body part', () => {
    expect(parseBodyPartParameter(['chest', 'back'])).toBeNull();
  });
});
