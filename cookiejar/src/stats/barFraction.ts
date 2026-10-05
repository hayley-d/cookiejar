export function largestValue(values: readonly (number | null)[]): number {
  let largest = 0;
  for (const value of values) {
    if (value !== null && value > largest) {
      largest = value;
    }
  }
  return largest;
}

export function barFraction(value: number | null, maximum: number): number {
  if (value === null || maximum <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, value / maximum));
}
