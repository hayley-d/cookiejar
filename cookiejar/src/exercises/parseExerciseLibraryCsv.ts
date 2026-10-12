import { isPreviewableImageUrl } from '@/images/imageUrls';
import type { BodyPart } from '@/types/BodyPart';
import type { TrackingType } from '@/types/TrackingType';

export type DefaultExercise = {
  name: string;
  bodyPart: BodyPart;
  imageUrl: string | null;
  videoUrl: string | null;
  defaultTrackingType: TrackingType;
};

const bodyPartsByCsvValue: Record<string, BodyPart> = {
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  knees: 'quadriceps',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  calves: 'calves',
  back: 'back',
  shoulder: 'shoulders',
  shoulders: 'shoulders',
  chest: 'chest',
  bicep: 'biceps',
  biceps: 'biceps',
  tricep: 'triceps',
  triceps: 'triceps',
  abs: 'core',
  core: 'core',
  grip: 'forearms',
  forearms: 'forearms',
  swimming: 'swimming',
};

const trackingTypesByCsvValue: Record<string, TrackingType> = {
  'reps and sets': 'repetitions',
  'weighted reps and sets': 'repetitions_and_weight',
  'assisted reps and sets': 'repetitions_and_assistance',
  distance: 'distance',
};

export function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let currentCell = '';
  let isInsideQuotes = false;
  for (let characterIndex = 0; characterIndex < line.length; characterIndex++) {
    const character = line[characterIndex];
    if (isInsideQuotes) {
      if (character === '"' && line[characterIndex + 1] === '"') {
        currentCell += '"';
        characterIndex++;
      } else if (character === '"') {
        isInsideQuotes = false;
      } else {
        currentCell += character;
      }
    } else if (character === '"') {
      isInsideQuotes = true;
    } else if (character === ',') {
      cells.push(currentCell);
      currentCell = '';
    } else {
      currentCell += character;
    }
  }
  cells.push(currentCell);
  return cells;
}

function optionalUrl(value: string, rowNumber: number) {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return null;
  }
  if (!isPreviewableImageUrl(trimmedValue)) {
    throw new Error(`Row ${rowNumber}: URL must start with https:// (${trimmedValue})`);
  }
  return trimmedValue;
}

export function parseExerciseLibraryCsv(csvText: string): DefaultExercise[] {
  const lines = csvText.split(/\r?\n/).slice(1);
  const seenNames = new Set<string>();
  const exercises: DefaultExercise[] = [];

  lines.forEach((line, lineIndex) => {
    const rowNumber = lineIndex + 2;
    const [name = '', bodyPartValue = '', imageUrlValue = '', trackingValue = '', videoUrlValue = ''] =
      splitCsvLine(line).map((cell) => cell.trim());
    if (name.length === 0) {
      return;
    }

    const bodyPart = bodyPartsByCsvValue[bodyPartValue.toLowerCase()];
    if (bodyPart === undefined) {
      throw new Error(`Row ${rowNumber}: unknown body part "${bodyPartValue}"`);
    }

    const defaultTrackingType = trackingTypesByCsvValue[trackingValue.toLowerCase()];
    if (defaultTrackingType === undefined) {
      throw new Error(`Row ${rowNumber}: unknown tracking "${trackingValue}"`);
    }

    const normalizedName = name.toLowerCase();
    if (seenNames.has(normalizedName)) {
      throw new Error(`Row ${rowNumber}: duplicate exercise "${name}"`);
    }
    seenNames.add(normalizedName);

    exercises.push({
      name,
      bodyPart,
      imageUrl: optionalUrl(imageUrlValue, rowNumber),
      videoUrl: optionalUrl(videoUrlValue, rowNumber),
      defaultTrackingType,
    });
  });

  return exercises;
}
