import type { Ref } from 'react';
import { FlatList, type FlatListProps } from 'react-native';

type SnapListProperties<Item> = Omit<
  FlatListProps<Item>,
  'horizontal' | 'pagingEnabled' | 'snapToInterval' | 'decelerationRate'
> & {
  snapInterval: number;
  ref?: Ref<FlatList<Item>>;
};

export function SnapList<Item>({ snapInterval, ...snapListProperties }: SnapListProperties<Item>) {
  return (
    <FlatList
      horizontal
      snapToInterval={snapInterval}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      {...snapListProperties}
    />
  );
}
