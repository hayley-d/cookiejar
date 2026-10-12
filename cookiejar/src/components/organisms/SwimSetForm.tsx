import { Button } from '@/components/atoms/Button';
import { DurationInput } from '@/components/atoms/DurationInput';
import { NumberInput } from '@/components/atoms/NumberInput';
import { ChipGroup } from '@/components/molecules/ChipGroup';
import { FormField } from '@/components/molecules/FormField';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { Stepper } from '@/components/molecules/Stepper';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { describeSwimSet } from '@/swimming/describeSwimSet';
import { formatSwimDistance, swimSetDistance } from '@/swimming/swimDistance';
import { swimDistancePresets } from '@/swimming/swimDistancePresets';
import type { EditorSwimSet, SwimSetChanges, SwimStroke } from '@/swimming/swimEditorReducer';
import type { SwimPoolLength } from '@/types/SwimPoolLength';
import { swimRestModeLabels, swimRestModes, type SwimRestMode } from '@/types/SwimRestMode';

type SwimSetFormProperties = {
  set: EditorSwimSet;
  poolLengthMeters: SwimPoolLength;
  strokes: SwimStroke[];
  onChangeSet: (changes: SwimSetChanges) => void;
  onRemove: () => void;
};

const maximumRepetitions = 99;
const defaultSendOffSeconds = 90;

const restModeSegments = swimRestModes.map((restMode) => ({ value: restMode, label: swimRestModeLabels[restMode] }));

export function SwimSetForm({ set, poolLengthMeters, strokes, onChangeSet, onRemove }: SwimSetFormProperties) {
  const strokeOptions = strokes.map((stroke) => ({ value: String(stroke.id), label: stroke.name }));
  const presetOptions = swimDistancePresets(poolLengthMeters).map((distanceMeters) => ({
    value: String(distanceMeters),
    label: `${distanceMeters} m`,
  }));
  const isPresetDistance = presetOptions.some((option) => option.value === String(set.distanceMeters));

  const chooseStroke = (strokeIdentifier: string) => {
    const stroke = strokes.find((candidate) => String(candidate.id) === strokeIdentifier);
    if (stroke !== undefined) {
      onChangeSet({ exerciseId: stroke.id, exerciseName: stroke.name });
    }
  };

  const chooseRestMode = (restMode: SwimRestMode) => {
    onChangeSet({
      restMode,
      sendOffSeconds: restMode === 'send_off' ? (set.sendOffSeconds ?? defaultSendOffSeconds) : set.sendOffSeconds,
    });
  };

  return (
    <ScrollBox gap="large" automaticallyAdjustKeyboardInsets>
      <Typography variant="heading">{describeSwimSet(set)}</Typography>
      <Typography color="textSecondary">{formatSwimDistance(swimSetDistance(set))}</Typography>
      <FormField label="Stroke">
        <ChipGroup options={strokeOptions} selectedValue={String(set.exerciseId)} onSelect={chooseStroke} />
      </FormField>
      <FormField label="Repetitions">
        <Stepper
          value={set.repetitions}
          step={1}
          minimum={1}
          maximum={maximumRepetitions}
          accessibilityLabel="repetitions"
          formatValue={(value) => `${value}×`}
          onChangeValue={(repetitions) => onChangeSet({ repetitions })}
        />
      </FormField>
      <FormField label="Distance in metres">
        <ChipGroup
          options={presetOptions}
          selectedValue={isPresetDistance ? String(set.distanceMeters) : null}
          onSelect={(distance) => onChangeSet({ distanceMeters: Number(distance) })}
        />
        <NumberInput
          value={set.distanceMeters}
          decimalPlaces={0}
          accessibilityLabel="Distance in metres"
          onChangeValue={(distanceMeters) => {
            if (distanceMeters !== null && distanceMeters > 0) {
              onChangeSet({ distanceMeters });
            }
          }}
        />
      </FormField>
      <FormField label="Rest">
        <SegmentedControl segments={restModeSegments} selectedValue={set.restMode} onSelect={chooseRestMode} />
      </FormField>
      {set.restMode === 'fixed' ? (
        <FormField label="Rest after each rep">
          <DurationInput
            seconds={set.restSeconds}
            accessibilityLabel="Rest after each rep"
            placeholder="None, e.g. 0:30"
            onChangeSeconds={(restSeconds) => onChangeSet({ restSeconds })}
          />
        </FormField>
      ) : (
        <FormField label="Start each rep every">
          <DurationInput
            seconds={set.sendOffSeconds}
            accessibilityLabel="Send-off interval"
            placeholder="e.g. 1:45"
            onChangeSeconds={(sendOffSeconds) => {
              if (sendOffSeconds !== null && sendOffSeconds > 0) {
                onChangeSet({ sendOffSeconds });
              }
            }}
          />
        </FormField>
      )}
      <Button label="Remove set" variant="secondary" onPress={onRemove} />
    </ScrollBox>
  );
}
