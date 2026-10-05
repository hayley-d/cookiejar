import { describe, expect, test } from 'bun:test';

import {
  editWorkoutRouteName,
  shouldGuardLeavingBuilder,
  type BuilderLeaveSituation,
} from '@/workouts/shouldGuardLeavingBuilder';

const unsavedRootSituation: BuilderLeaveSituation = {
  hasUnsavedChanges: true,
  isLeavingPermitted: false,
  isReordering: false,
  routeIndex: 0,
  routeName: 'new',
};

describe('shouldGuardLeavingBuilder', () => {
  test('guards the root of the builder, whose removal dismisses the builder', () => {
    expect(shouldGuardLeavingBuilder(unsavedRootSituation)).toBe(true);
  });

  test('guards the edit route when it is the root of the builder', () => {
    expect(shouldGuardLeavingBuilder({ ...unsavedRootSituation, routeName: editWorkoutRouteName })).toBe(true);
  });

  test('guards the edit route even when it is not the root of the builder', () => {
    expect(
      shouldGuardLeavingBuilder({ ...unsavedRootSituation, routeIndex: 1, routeName: editWorkoutRouteName }),
    ).toBe(true);
  });

  test('does not guard a later builder step, so stepping back does not ask', () => {
    expect(shouldGuardLeavingBuilder({ ...unsavedRootSituation, routeIndex: 1, routeName: 'editor' })).toBe(false);
    expect(shouldGuardLeavingBuilder({ ...unsavedRootSituation, routeIndex: 1, routeName: 'class-details' })).toBe(
      false,
    );
  });

  test('does not guard without unsaved changes', () => {
    expect(shouldGuardLeavingBuilder({ ...unsavedRootSituation, hasUnsavedChanges: false })).toBe(false);
  });

  test('does not guard once Save or Discard has permitted leaving', () => {
    expect(shouldGuardLeavingBuilder({ ...unsavedRootSituation, isLeavingPermitted: true })).toBe(false);
  });

  test('does not guard while a block is being dragged, so a downward drag cannot prompt Discard', () => {
    expect(shouldGuardLeavingBuilder({ ...unsavedRootSituation, isReordering: true })).toBe(false);
    expect(
      shouldGuardLeavingBuilder({
        ...unsavedRootSituation,
        isReordering: true,
        routeIndex: 1,
        routeName: editWorkoutRouteName,
      }),
    ).toBe(false);
  });
});
