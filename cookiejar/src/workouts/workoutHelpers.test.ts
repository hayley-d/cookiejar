import { describe, expect, test } from 'bun:test';

import { activityTypeNuggie } from '@/workouts/activityTypeNuggie';
import { classTypeNuggie } from '@/workouts/classTypeNuggie';
import { describeWorkout } from '@/workouts/describeWorkout';
import { filterWorkouts } from '@/workouts/filterWorkouts';
import { workoutNameError } from '@/workouts/workoutNameError';
import { workoutNuggie } from '@/workouts/workoutNuggie';
import { workoutTypeLabel } from '@/workouts/workoutTypeLabel';

describe('workoutNameError', () => {
  test('a name is required', () => {
    expect(workoutNameError('')).toBe('Give your workout a name');
  });

  test('a name of only spaces is treated as empty', () => {
    expect(workoutNameError('   ')).toBe('Give your workout a name');
  });

  test('any other name is fine, including duplicates', () => {
    expect(workoutNameError(' Push Day ')).toBeNull();
  });
});

describe('describeWorkout', () => {
  test('a class shows its duration', () => {
    expect(describeWorkout({ kind: 'class', durationMinutes: 50, exerciseCount: 0 })).toBe('Class · 50 min');
  });

  test('a class without a duration shows only Class', () => {
    expect(describeWorkout({ kind: 'class', durationMinutes: null, exerciseCount: 0 })).toBe('Class');
  });

  test('an activity shows Activity', () => {
    expect(describeWorkout({ kind: 'activity', durationMinutes: null, exerciseCount: 0 })).toBe('Activity');
  });

  test('an individual workout counts its exercises', () => {
    expect(describeWorkout({ kind: 'individual', durationMinutes: null, exerciseCount: 6 })).toBe(
      'Individual · 6 exercises',
    );
  });

  test('one exercise is singular', () => {
    expect(describeWorkout({ kind: 'individual', durationMinutes: null, exerciseCount: 1 })).toBe(
      'Individual · 1 exercise',
    );
  });
});

describe('classTypeNuggie', () => {
  test('yoga and pilates have their own nuggie', () => {
    expect(classTypeNuggie('yoga')).toBe('yoga');
    expect(classTypeNuggie('pilates')).toBe('pilates');
  });

  test('every other class type shows the workout nuggie', () => {
    expect(classTypeNuggie('spin')).toBe('workout');
    expect(classTypeNuggie('barre')).toBe('workout');
    expect(classTypeNuggie('other')).toBe('workout');
  });
});

describe('activityTypeNuggie', () => {
  test('a hike shows the hiking nuggie', () => {
    expect(activityTypeNuggie('hike')).toBe('hiking');
  });

  test('a run shows the workout nuggie and a walk shows the good job nuggie', () => {
    expect(activityTypeNuggie('run')).toBe('workout');
    expect(activityTypeNuggie('walk')).toBe('goodJob');
  });
});

describe('workoutNuggie', () => {
  test('an individual workout shows the workout nuggie', () => {
    expect(workoutNuggie({ classType: null, activityType: null })).toBe('workout');
  });

  test('a class shows its class nuggie', () => {
    expect(workoutNuggie({ classType: 'yoga', activityType: null })).toBe('yoga');
    expect(workoutNuggie({ classType: 'spin', activityType: null })).toBe('workout');
  });

  test('an activity shows its activity nuggie', () => {
    expect(workoutNuggie({ classType: null, activityType: 'hike' })).toBe('hiking');
    expect(workoutNuggie({ classType: null, activityType: 'walk' })).toBe('goodJob');
  });
});

describe('workoutTypeLabel', () => {
  test('a class shows its class type and an activity its activity type', () => {
    expect(workoutTypeLabel({ classType: 'pilates', activityType: null })).toBe('Pilates');
    expect(workoutTypeLabel({ classType: null, activityType: 'run' })).toBe('Run');
  });

  test('an individual workout has no type label', () => {
    expect(workoutTypeLabel({ classType: null, activityType: null })).toBeNull();
  });
});

describe('filterWorkouts', () => {
  const workouts = [{ name: 'Morning Spin' }, { name: 'Push Day' }, { name: 'Leg Day' }];

  test('empty search keeps every workout', () => {
    expect(filterWorkouts(workouts, '  ')).toEqual(workouts);
  });

  test('matches part of the name ignoring case and spaces', () => {
    expect(filterWorkouts(workouts, ' day ').map((workout) => workout.name)).toEqual(['Push Day', 'Leg Day']);
    expect(filterWorkouts(workouts, 'SPIN').map((workout) => workout.name)).toEqual(['Morning Spin']);
  });

  test('no match gives an empty list', () => {
    expect(filterWorkouts(workouts, 'yoga')).toEqual([]);
  });
});
