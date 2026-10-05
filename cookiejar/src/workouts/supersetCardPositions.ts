type SupersetMember = {
  supersetGroup: string | null;
};

export type SupersetBracketPosition = 'start' | 'middle' | 'end';

export type SupersetCardPosition = {
  label: string | null;
  bracket: SupersetBracketPosition | null;
  isLinkedToNext: boolean;
  isLastItem: boolean;
};

export function toSupersetCardPositions(items: SupersetMember[]): SupersetCardPosition[] {
  return items.map((item, index) => {
    const { supersetGroup } = item;
    const isLastItem = index === items.length - 1;
    if (supersetGroup === null) {
      return { label: null, bracket: null, isLinkedToNext: false, isLastItem };
    }
    const isLinkedToPrevious = items[index - 1]?.supersetGroup === supersetGroup;
    const isLinkedToNext = items[index + 1]?.supersetGroup === supersetGroup;
    const numberInGroup = items.slice(0, index + 1).filter((earlier) => earlier.supersetGroup === supersetGroup).length;
    const bracket: SupersetBracketPosition = !isLinkedToPrevious ? 'start' : isLinkedToNext ? 'middle' : 'end';
    return { label: `${supersetGroup}${numberInGroup}`, bracket, isLinkedToNext, isLastItem };
  });
}
