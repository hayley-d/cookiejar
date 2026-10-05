import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { progressRangeLabels, type ProgressRange } from '@/progress/progressRanges';

type RangeSwitcherProperties<Range extends ProgressRange> = {
  ranges: readonly Range[];
  selectedRange: Range;
  onSelect: (range: Range) => void;
};

export function RangeSwitcher<Range extends ProgressRange>({
  ranges,
  selectedRange,
  onSelect,
}: RangeSwitcherProperties<Range>) {
  const segments = ranges.map((range) => ({ value: range, label: progressRangeLabels[range] }));

  return <SegmentedControl segments={segments} selectedValue={selectedRange} onSelect={onSelect} />;
}
