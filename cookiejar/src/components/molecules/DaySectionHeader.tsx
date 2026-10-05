import { TextButton } from '@/components/atoms/TextButton';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';

type DaySectionHeaderProperties = {
  title: string;
  onAdd: () => void;
};

export function DaySectionHeader({ title, onAdd }: DaySectionHeaderProperties) {
  return (
    <Stack direction="horizontal" align="center" justify="space-between">
      <Typography variant="label" color="textSecondary" accessibilityRole="header">
        {title.toLocaleUpperCase()}
      </Typography>
      <TextButton label="+ Add" accessibilityLabel={`Add a workout on ${title}`} onPress={onAdd} />
    </Stack>
  );
}
