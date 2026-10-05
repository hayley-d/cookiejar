import type { Ref } from 'react';
import { FlatList, type FlatListProps } from 'react-native';

type PagedListProperties<Item> = Omit<FlatListProps<Item>, 'horizontal' | 'pagingEnabled'> & {
  ref?: Ref<FlatList<Item>>;
};

export type PagedListHandle<Item> = FlatList<Item>;

export function PagedList<Item>(pagedListProperties: PagedListProperties<Item>) {
  return (
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      {...pagedListProperties}
    />
  );
}
