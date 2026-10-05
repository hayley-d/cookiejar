import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { SwipeableBox } from '@/components/primitives/SwipeableBox';
import { Typography } from '@/components/primitives/Typography';
import { formatShortDate } from '@/dates/formatShortDate';
import { describeBodyMeasurement } from '@/measurements/describeBodyMeasurement';
import type { BodyMeasurement } from '@/types/BodyMeasurement';
import { useTheme } from '@/theme/useTheme';

type MeasurementRowProperties = {
  measurement: BodyMeasurement;
  onDelete: () => void;
};

export function MeasurementRow({ measurement, onDelete }: MeasurementRowProperties) {
  const theme = useTheme();
  const description = describeBodyMeasurement(measurement);
  const dateText = formatShortDate(measurement.measuredOn);

  return (
    <SwipeableBox actionLabel="Delete" onSwipeLeft={onDelete}>
      <Stack
        direction="horizontal"
        gap="medium"
        align="center"
        accessible
        accessibilityLabel={`${dateText}, ${description.title}${description.detail ? `, ${description.detail}` : ''}`}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Box flex={1} gap="extraSmall">
          <Typography variant="label">{description.title}</Typography>
          {description.detail ? (
            <Typography variant="caption" color="textSecondary" numberOfLines={2}>
              {description.detail}
            </Typography>
          ) : null}
        </Box>
        <Typography variant="caption" color="textSecondary">
          {dateText}
        </Typography>
      </Stack>
    </SwipeableBox>
  );
}
