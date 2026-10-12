type DistanceSet = { repetitions: number; distanceMeters: number };
type DistanceBlock = { rounds: number; sets: DistanceSet[] };
type DistanceSection = { blocks: DistanceBlock[] };

export function swimSetDistance(set: DistanceSet): number {
  return set.repetitions * set.distanceMeters;
}

export function swimBlockDistance(block: DistanceBlock): number {
  return block.rounds * block.sets.reduce((total, set) => total + swimSetDistance(set), 0);
}

export function swimSectionDistance(section: DistanceSection): number {
  return section.blocks.reduce((total, block) => total + swimBlockDistance(block), 0);
}

export function swimWorkoutDistance(sections: DistanceSection[]): number {
  return sections.reduce((total, section) => total + swimSectionDistance(section), 0);
}

export function formatSwimDistance(distanceMeters: number): string {
  return `${String(distanceMeters).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} m`;
}
