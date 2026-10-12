import { useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { DurationInput } from '@/components/atoms/DurationInput';
import { TextButton } from '@/components/atoms/TextButton';
import { SessionTopBar } from '@/components/molecules/SessionTopBar';
import { SwimRepetitionRow } from '@/components/molecules/SwimRepetitionRow';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { describeSwimBlockRest, describeSwimSet } from '@/swimming/describeSwimSet';
import { defaultSwimDurationSeconds } from '@/swimming/swimDuration';
import { formatSwimDistance, swimSectionDistance, swimWorkoutDistance } from '@/swimming/swimDistance';
import type { SwimSessionBlock, SwimSessionSection } from '@/swimming/swimSessionTypes';
import { countOpenRepetitions, flattenSwimRepetitions, swumDistance } from '@/swimming/swimSessionTotals';
import { useTheme } from '@/theme/useTheme';

type SwimSessionLoggerProperties = {
  workoutName: string;
  startedAt: string;
  sections: SwimSessionSection[];
  isFinishing: boolean;
  onToggleRepetition: (repetitionId: number) => void;
  onMarkAllDone: () => void;
  onFinish: (durationSeconds: number) => void;
  onDiscard: () => void;
};

type SwimBlockViewProperties = {
  block: SwimSessionBlock;
  onToggleRepetition: (repetitionId: number) => void;
};

function SwimBlockView({ block, onToggleRepetition }: SwimBlockViewProperties) {
  const restText = describeSwimBlockRest(block.restAfterSeconds);
  const roundIndexes = Array.from({ length: block.rounds }, (_, roundIndex) => roundIndex);

  return (
    <Box gap="medium">
      {roundIndexes.map((roundIndex) => (
        <Box key={roundIndex} gap="small">
          {block.rounds > 1 ? (
            <Typography variant="label" color="accent">
              {`Round ${roundIndex + 1} of ${block.rounds}`}
            </Typography>
          ) : null}
          {block.sets.map((set) => (
            <Box key={set.id} gap="small">
              <Typography>{describeSwimSet(set)}</Typography>
              <SwimRepetitionRow
                repetitions={set.repetitionRows.filter((repetition) => repetition.roundIndex === roundIndex)}
                onToggleRepetition={onToggleRepetition}
              />
            </Box>
          ))}
        </Box>
      ))}
      {restText === null ? null : (
        <Typography variant="caption" color="textSecondary">
          {restText}
        </Typography>
      )}
    </Box>
  );
}

export function SwimSessionLogger({
  workoutName,
  startedAt,
  sections,
  isFinishing,
  onToggleRepetition,
  onMarkAllDone,
  onFinish,
  onDiscard,
}: SwimSessionLoggerProperties) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [isChoosingDuration, setIsChoosingDuration] = useState(false);

  const repetitionRecords = flattenSwimRepetitions(sections);
  const swumMeters = swumDistance(repetitionRecords);
  const openRepetitionCount = countOpenRepetitions(repetitionRecords);
  const plannedMeters = swimWorkoutDistance(sections);

  const requestFinish = () => {
    if (swumMeters === 0) {
      Alert.alert('No reps ticked', 'Nothing has been ticked yet. Discard this swim instead?', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onDiscard },
      ]);
      return;
    }
    setDurationSeconds(defaultSwimDurationSeconds(startedAt, new Date()));
    setIsChoosingDuration(true);
  };

  return (
    <Box flex={1} background="background">
      <SessionTopBar
        title={workoutName.toUpperCase()}
        topInset={safeAreaInsets.top}
        isQuitDisabled={isFinishing}
        onQuit={onDiscard}
      />
      {isChoosingDuration ? (
        <ScrollBox automaticallyAdjustKeyboardInsets>
          <Card>
            <Box gap="small">
              <Typography variant="heading" align="center">
                {formatSwimDistance(swumMeters)}
              </Typography>
              <Typography variant="label" align="center">
                Duration
              </Typography>
              <DurationInput
                seconds={durationSeconds}
                accessibilityLabel="Swim duration"
                placeholder="e.g. 40:00"
                onChangeSeconds={setDurationSeconds}
              />
              <Typography variant="caption" color="textSecondary" align="center">
                Change it if you are logging this swim afterwards.
              </Typography>
            </Box>
          </Card>
        </ScrollBox>
      ) : (
        <ScrollBox>
          <Box gap="small">
            <Typography variant="heading" align="center">
              {`${formatSwimDistance(swumMeters)} of ${formatSwimDistance(plannedMeters)}`}
            </Typography>
            <Button
              label="MARK ALL DONE"
              variant="secondary"
              onPress={onMarkAllDone}
              disabled={openRepetitionCount === 0}
            />
          </Box>
          {sections.map((section) => (
            <Card key={section.id}>
              <Box gap="medium">
                <Box direction="row" justify="space-between" align="center">
                  <Typography variant="heading">{section.name}</Typography>
                  <Typography variant="label" color="textSecondary">
                    {formatSwimDistance(swimSectionDistance(section))}
                  </Typography>
                </Box>
                {section.blocks.length === 0 ? <Typography color="textSecondary">No sets</Typography> : null}
                {section.blocks.map((block) => (
                  <SwimBlockView key={block.id} block={block} onToggleRepetition={onToggleRepetition} />
                ))}
              </Box>
            </Card>
          ))}
        </ScrollBox>
      )}
      <Box padding="medium" gap="small" style={{ paddingBottom: safeAreaInsets.bottom + theme.spacing.medium }}>
        {isChoosingDuration ? (
          <>
            <Button
              label="FINISH SWIM"
              onPress={() => durationSeconds !== null && onFinish(durationSeconds)}
              disabled={isFinishing || durationSeconds === null || durationSeconds <= 0}
            />
            <Box align="center">
              <TextButton label="Keep logging" onPress={() => setIsChoosingDuration(false)} disabled={isFinishing} />
            </Box>
          </>
        ) : (
          <Button label="FINISH" onPress={requestFinish} disabled={isFinishing} />
        )}
      </Box>
    </Box>
  );
}
