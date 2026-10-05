import { actualValuesOf, targetValuesOf, type FillableSet, type SetValues } from '@/sessions/fillSetForTick';
import { emptyTargetSetValues } from '@/workouts/targetSetColumns';

function hasAnyValue(values: SetValues): boolean {
  return Object.values(values).some((value) => value !== null);
}

export function valuesForAddedSet(lastSet: FillableSet | null): SetValues {
  if (lastSet === null) {
    return { ...emptyTargetSetValues };
  }
  const actualValues = actualValuesOf(lastSet);
  return hasAnyValue(actualValues) ? actualValues : targetValuesOf(lastSet);
}
