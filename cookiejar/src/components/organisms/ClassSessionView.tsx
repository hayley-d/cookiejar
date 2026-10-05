import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { ElapsedTimer } from '@/components/atoms/ElapsedTimer';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { TextButton } from '@/components/atoms/TextButton';
import { Box } from '@/components/primitives/Box';
import { ProgressRingBox } from '@/components/primitives/ProgressRingBox';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { elapsedSecondsBetween } from '@/sessions/calculateSessionTotals';
import { classRingProgress, plannedDurationLabel } from '@/sessions/classRingProgress';
import { useTheme } from '@/theme/useTheme';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

type ClassSessionViewProperties = {
  session: SessionWithExercises;
  isFinishing: boolean;
  onChangeNotes: (notes: string) => void;
  onMarkComplete: () => void;
  onDiscard: () => void;
};

export function ClassSessionView({
  session,
  isFinishing,
  onChangeNotes,
  onMarkComplete,
  onDiscard,
}: ClassSessionViewProperties) {
  const theme = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), theme.durations.timerTick);
    return () => clearInterval(interval);
  }, [theme.durations.timerTick]);

  const nuggie =
    session.classType === null
      ? 'workout'
      : chooseNuggie({ kind: 'classDisplay', classType: session.classType }, new Date(session.startedAt));
  const progress = classRingProgress(elapsedSecondsBetween(session.startedAt, now), session.plannedDurationMinutes);
  const durationLabel = plannedDurationLabel(session.plannedDurationMinutes);

  return (
    <Box flex={1} background="background">
      <Box direction="row" align="center" gap="small" paddingHorizontal="medium" paddingVertical="small">
        <TextButton label="✕ Discard" color="danger" onPress={onDiscard} disabled={isFinishing} />
        <Box flex={1}>
          <Typography variant="heading" numberOfLines={1} accessibilityRole="header">
            {session.workoutName.toUpperCase()}
          </Typography>
        </Box>
      </Box>
      <ScrollBox automaticallyAdjustKeyboardInsets>
        <Box align="center" gap="medium">
          <NuggieImage name={nuggie} size={theme.sizes.sessionClassNuggie} />
          <ProgressRingBox progress={progress}>
            <Box align="center">
              <ElapsedTimer startedAt={session.startedAt} variant="display" />
              {durationLabel === null ? null : <Typography color="textSecondary">{durationLabel}</Typography>}
            </Box>
          </ProgressRingBox>
        </Box>
        <TextField
          value={session.notes ?? ''}
          onChangeText={onChangeNotes}
          placeholder="Notes"
          accessibilityLabel="Session notes"
          multiline
          textAlignVertical="top"
          style={{ minHeight: theme.sizes.sessionNotesMinimumHeight }}
        />
      </ScrollBox>
      <Box padding="medium">
        <Button label="MARK COMPLETE" onPress={onMarkComplete} disabled={isFinishing} />
      </Box>
    </Box>
  );
}
