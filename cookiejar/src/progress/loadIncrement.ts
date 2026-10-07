const lightLoadKilograms = 20;
const lightLoadIncrementKilograms = 1;
const loadIncrementKilograms = 2.5;

export function incrementForLoad(loadKilograms: number): number {
  return loadKilograms < lightLoadKilograms ? lightLoadIncrementKilograms : loadIncrementKilograms;
}

export function roundDownToIncrement(loadKilograms: number): number {
  const increment = incrementForLoad(loadKilograms);
  return Math.floor(loadKilograms / increment) * increment;
}
