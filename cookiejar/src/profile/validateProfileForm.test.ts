import { describe, expect, test } from 'bun:test';

import { snapStepGoal } from '@/profile/profileFormRules';
import { toProfileUpdate, validateProfileForm, type ProfileFormValues } from '@/profile/validateProfileForm';

const today = '2026-10-05';

const validValues: ProfileFormValues = {
  displayName: 'Hayley',
  birthDate: '1990-04-12',
  sex: 'female',
  heightCentimetres: 168.5,
  goal: 'strength',
  weeklyWorkoutTarget: 4,
  dailyStepGoal: 10000,
};

describe('validateProfileForm', () => {
  test('accepts valid values', () => {
    expect(validateProfileForm(validValues, today)).toEqual({});
  });

  test('accepts unset optional fields', () => {
    expect(validateProfileForm({ ...validValues, birthDate: null, heightCentimetres: null }, today)).toEqual({});
  });

  test('accepts a birth date of today and rejects one in the future', () => {
    expect(validateProfileForm({ ...validValues, birthDate: today }, today)).toEqual({});
    expect(validateProfileForm({ ...validValues, birthDate: '2026-10-06' }, today).birthDate).toBeDefined();
  });

  test('height accepts the range edges and rejects outside them', () => {
    expect(validateProfileForm({ ...validValues, heightCentimetres: 50 }, today)).toEqual({});
    expect(validateProfileForm({ ...validValues, heightCentimetres: 272 }, today)).toEqual({});
    expect(validateProfileForm({ ...validValues, heightCentimetres: 49.9 }, today).heightCentimetres).toBeDefined();
    expect(validateProfileForm({ ...validValues, heightCentimetres: 272.1 }, today).heightCentimetres).toBeDefined();
    expect(validateProfileForm({ ...validValues, heightCentimetres: 0 }, today).heightCentimetres).toBeDefined();
  });

  test('weekly target is 1 to 14 whole numbers', () => {
    expect(validateProfileForm({ ...validValues, weeklyWorkoutTarget: 1 }, today)).toEqual({});
    expect(validateProfileForm({ ...validValues, weeklyWorkoutTarget: 14 }, today)).toEqual({});
    expect(validateProfileForm({ ...validValues, weeklyWorkoutTarget: 0 }, today).weeklyWorkoutTarget).toBeDefined();
    expect(validateProfileForm({ ...validValues, weeklyWorkoutTarget: 15 }, today).weeklyWorkoutTarget).toBeDefined();
    expect(validateProfileForm({ ...validValues, weeklyWorkoutTarget: 3.5 }, today).weeklyWorkoutTarget).toBeDefined();
  });

  test('step goal moves in steps of 500', () => {
    expect(validateProfileForm({ ...validValues, dailyStepGoal: 500 }, today)).toEqual({});
    expect(validateProfileForm({ ...validValues, dailyStepGoal: 50000 }, today)).toEqual({});
    expect(validateProfileForm({ ...validValues, dailyStepGoal: 8200 }, today).dailyStepGoal).toBeDefined();
    expect(validateProfileForm({ ...validValues, dailyStepGoal: 0 }, today).dailyStepGoal).toBeDefined();
    expect(validateProfileForm({ ...validValues, dailyStepGoal: 50500 }, today).dailyStepGoal).toBeDefined();
  });
});

describe('snapStepGoal', () => {
  test('rounds to the nearest 500 within the allowed range', () => {
    expect(snapStepGoal(8000)).toBe(8000);
    expect(snapStepGoal(8200)).toBe(8000);
    expect(snapStepGoal(8250)).toBe(8500);
    expect(snapStepGoal(0)).toBe(500);
    expect(snapStepGoal(99999)).toBe(50000);
  });
});

describe('toProfileUpdate', () => {
  test('trims the name', () => {
    expect(toProfileUpdate({ ...validValues, displayName: '  Hayley  ' }).displayName).toBe('Hayley');
  });

  test('stores an empty or blank name as null', () => {
    expect(toProfileUpdate({ ...validValues, displayName: '' }).displayName).toBeNull();
    expect(toProfileUpdate({ ...validValues, displayName: '   ' }).displayName).toBeNull();
  });

  test('passes the other values through', () => {
    expect(toProfileUpdate(validValues)).toEqual(validValues);
  });
});
