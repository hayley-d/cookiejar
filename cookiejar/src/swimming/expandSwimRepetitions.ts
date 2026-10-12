type ExpandableSet = { repetitions: number };
type ExpandableBlock = { rounds: number; sets: ExpandableSet[] };
type ExpandableSection = { blocks: ExpandableBlock[] };

export type SwimRepetitionPosition = {
  sectionIndex: number;
  blockIndex: number;
  setIndex: number;
  roundIndex: number;
  repetitionIndex: number;
};

export function expandSwimRepetitions(sections: readonly ExpandableSection[]): SwimRepetitionPosition[] {
  const positions: SwimRepetitionPosition[] = [];
  sections.forEach((section, sectionIndex) => {
    section.blocks.forEach((block, blockIndex) => {
      for (let roundIndex = 0; roundIndex < block.rounds; roundIndex += 1) {
        block.sets.forEach((set, setIndex) => {
          for (let repetitionIndex = 0; repetitionIndex < set.repetitions; repetitionIndex += 1) {
            positions.push({ sectionIndex, blockIndex, setIndex, roundIndex, repetitionIndex });
          }
        });
      }
    });
  });
  return positions;
}
