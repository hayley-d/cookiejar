export type HealthSource = {
  sourceName: string;
  bundleIdentifier: string;
};

export function isGarminSource(source: HealthSource): boolean {
  return source.bundleIdentifier.toLowerCase().includes('garmin') || source.sourceName.includes('Garmin');
}
