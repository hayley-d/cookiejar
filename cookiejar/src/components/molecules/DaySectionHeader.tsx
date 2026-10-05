import { IconButton } from '@/components/atoms/IconButton';
import { TextButton } from '@/components/atoms/TextButton';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';

type DaySectionHeaderProperties = {
  title: string;
  onAdd: () => void;
  onOpenMenu: () => void;
};

export function DaySectionHeader({ title, onAdd, onOpenMenu }: DaySectionHeaderProperties) {
  return (
    <Stack direction="horizontal" align="center" justify="space-between">
      <Typography variant="label" color="textSecondary" accessibilityRole="header">
        {title.toLocaleUpperCase()}
      </Typography>
      <Stack direction="horizontal" align="center" gap="small">
        <TextButton label="+ Add" accessibilityLabel={`Add a workout on ${title}`} onPress={onAdd} />
        <IconButton icon="ellipsis" accessibilityLabel={`More options for ${title}`} onPress={onOpenMenu} />
      </Stack>
    </Stack>
  );
}
