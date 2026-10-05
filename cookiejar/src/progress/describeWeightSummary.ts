export function describeWeightSummary(latestWeightKilograms: number, change: number | null, days: number): string {
  const latestText = `${latestWeightKilograms} kg`;
  if (change === null) {
    return latestText;
  }
  if (change === 0) {
    return `${latestText} no change in ${days} days`;
  }
  const arrow = change > 0 ? '↑' : '↓';
  return `${latestText} ${arrow}${Math.abs(change)} kg in ${days} days`;
}
