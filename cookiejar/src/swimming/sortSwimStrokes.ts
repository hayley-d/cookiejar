export const swimStrokeDisplayOrder = [
  'Freestyle',
  'Breaststroke',
  'Backstroke',
  'Butterfly',
  'Freestyle Kick',
  'Breaststroke Kick',
  'Backstroke Kick',
  'Butterfly Kick',
  'Pull',
  'Medley',
  'Choice',
  'Drill',
  'Underwater Streamline',
];

function displayRank(strokeName: string): number {
  const rank = swimStrokeDisplayOrder.indexOf(strokeName);
  return rank === -1 ? swimStrokeDisplayOrder.length : rank;
}

export function sortSwimStrokes<Stroke extends { name: string }>(strokes: Stroke[]): Stroke[] {
  return [...strokes].sort((first, second) => {
    const rankDifference = displayRank(first.name) - displayRank(second.name);
    return rankDifference !== 0 ? rankDifference : first.name.localeCompare(second.name);
  });
}
