const metersPerKilometer = 1000;

export function formatDistance(distanceMeters: number): string {
  return `${(distanceMeters / metersPerKilometer).toFixed(2)} km`;
}

export function formatElevationGain(elevationGainMeters: number): string {
  return `${Math.round(elevationGainMeters)} m`;
}

export function formatActiveKilocalories(activeKilocalories: number): string {
  return `${Math.round(activeKilocalories)} kcal`;
}

export function formatAverageHeartRate(averageHeartRate: number): string {
  return `${Math.round(averageHeartRate)} bpm`;
}
