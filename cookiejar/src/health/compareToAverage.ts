export type AverageComparisonDirection = 'up' | 'down' | 'level';
export type AverageComparisonTone = 'default' | 'positive' | 'attention';

export type AverageComparison = {
  average: number;
  difference: number;
  direction: AverageComparisonDirection;
  tone: AverageComparisonTone;
};

const attentionDifferenceThreshold = 5;

export function compareToAverage(
  todayValue: number | null,
  previousValues: readonly (number | null)[],
): AverageComparison | null {
  if (todayValue === null) {
    return null;
  }
  const presentValues = previousValues.filter((value): value is number => value !== null);
  if (presentValues.length === 0) {
    return null;
  }
  const average = presentValues.reduce((sum, value) => sum + value, 0) / presentValues.length;
  const roundedDifference = Math.round(todayValue - average);
  const difference = roundedDifference === 0 ? 0 : roundedDifference;
  const direction = difference > 0 ? 'up' : difference < 0 ? 'down' : 'level';
  const tone = direction !== 'up' ? 'positive' : difference >= attentionDifferenceThreshold ? 'attention' : 'default';
  return { average, difference, direction, tone };
}
