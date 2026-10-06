import { Card } from '@/components/atoms/Card';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { StatSummaryItem } from '@/stats/summarizeStatDays';

type StatSummaryCardProperties = {
  items: readonly StatSummaryItem[];
};

export function StatSummaryCard({ items }: StatSummaryCardProperties) {
  return (
    <Card>
      <Box direction="row" gap="small">
        {items.map((item) => (
          <Box
            key={item.label}
            flex={1}
            gap="extraSmall"
            accessible
            accessibilityLabel={[item.label, item.value, item.caption].filter(Boolean).join(' ')}
          >
            <Typography variant="caption" color="textSecondary">
              {item.label}
            </Typography>
            <Typography variant="heading">{item.value}</Typography>
            {item.caption === undefined ? null : (
              <Typography variant="caption" color="textSecondary">
                {item.caption}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
}
