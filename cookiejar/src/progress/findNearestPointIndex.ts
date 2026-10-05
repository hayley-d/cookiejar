export function findNearestPointIndex(positions: number[], target: number): number | null {
  let nearestIndex: number | null = null;
  let nearestDistance = Infinity;
  positions.forEach((position, index) => {
    const distance = Math.abs(position - target);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });
  return nearestIndex;
}
