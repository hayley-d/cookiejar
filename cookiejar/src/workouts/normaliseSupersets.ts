type SupersetMember = {
  supersetGroup: string | null;
};

const groupLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function countMembersByGroup(items: SupersetMember[]) {
  const memberCounts = new Map<string, number>();
  for (const item of items) {
    if (item.supersetGroup !== null) {
      memberCounts.set(item.supersetGroup, (memberCounts.get(item.supersetGroup) ?? 0) + 1);
    }
  }
  return memberCounts;
}

export function normaliseSupersets<Item extends SupersetMember>(items: Item[]): Item[] {
  const memberCounts = countMembersByGroup(items);
  const lettersByGroup = new Map<string, string>();

  return items.map((item) => {
    const { supersetGroup } = item;
    if (supersetGroup === null) {
      return item;
    }
    if ((memberCounts.get(supersetGroup) ?? 0) < 2) {
      return { ...item, supersetGroup: null };
    }
    let letter = lettersByGroup.get(supersetGroup);
    if (letter === undefined) {
      letter = groupLetters[lettersByGroup.size] ?? String(lettersByGroup.size + 1);
      lettersByGroup.set(supersetGroup, letter);
    }
    return letter === supersetGroup ? item : { ...item, supersetGroup: letter };
  });
}
