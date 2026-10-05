import { TextButton } from '@/components/atoms/TextButton';
import { PersonalRecordItemRow } from '@/components/organisms/PersonalRecordItemRow';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { PersonalRecordListItem } from '@/progress/buildPersonalRecordList';

type RecentRecordsSectionProperties = {
  items: readonly PersonalRecordListItem[];
  onPressItem: (sessionId: number) => void;
  onSeeAll: () => void;
};

export function RecentRecordsSection({ items, onPressItem, onSeeAll }: RecentRecordsSectionProperties) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Box gap="small">
      <Box direction="row" justify="space-between" align="center">
        <Typography variant="heading">Recent records</Typography>
        <TextButton label="See all" onPress={onSeeAll} />
      </Box>
      {items.map((item) => (
        <PersonalRecordItemRow key={item.key} item={item} onPress={onPressItem} />
      ))}
    </Box>
  );
}
