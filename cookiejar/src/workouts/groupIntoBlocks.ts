type BlockMember = {
  key: string;
  supersetGroup: string | null;
};

export type ItemBlock<Item extends BlockMember> = {
  key: string;
  supersetGroup: string | null;
  items: Item[];
};

export function groupIntoBlocks<Item extends BlockMember>(items: Item[]): ItemBlock<Item>[] {
  const blocks: ItemBlock<Item>[] = [];
  for (const item of items) {
    const previousBlock = blocks.at(-1);
    if (previousBlock !== undefined && item.supersetGroup !== null && previousBlock.supersetGroup === item.supersetGroup) {
      previousBlock.items.push(item);
    } else {
      blocks.push({ key: item.key, supersetGroup: item.supersetGroup, items: [item] });
    }
  }
  return blocks;
}

export function applyBlockOrder<Item extends BlockMember>(items: Item[], blockKeys: string[]): Item[] {
  const blocks = groupIntoBlocks(items);
  const blocksByKey = new Map(blocks.map((block) => [block.key, block]));
  const orderedBlocks: ItemBlock<Item>[] = [];
  for (const blockKey of blockKeys) {
    const block = blocksByKey.get(blockKey);
    if (block !== undefined) {
      orderedBlocks.push(block);
      blocksByKey.delete(blockKey);
    }
  }
  const unlistedBlocks = blocks.filter((block) => blocksByKey.has(block.key));
  const orderedItems = [...orderedBlocks, ...unlistedBlocks].flatMap((block) => block.items);
  const isUnchanged = orderedItems.every((item, index) => item === items[index]);
  return isUnchanged ? items : orderedItems;
}

export function moveBlockKey(blockKeys: string[], fromIndex: number, slotOffset: number): string[] {
  const movedKey = blockKeys[fromIndex];
  if (movedKey === undefined) {
    return blockKeys;
  }
  const toIndex = Math.min(Math.max(fromIndex + slotOffset, 0), blockKeys.length - 1);
  if (toIndex === fromIndex) {
    return blockKeys;
  }
  const remainingKeys = blockKeys.filter((blockKey, index) => index !== fromIndex);
  return [...remainingKeys.slice(0, toIndex), movedKey, ...remainingKeys.slice(toIndex)];
}
