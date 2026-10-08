import { describe, expect, test } from 'bun:test';

import { defaultExercises } from '@/exercises/defaultExercises';
import { parseExerciseLibraryCsv, splitCsvLine } from '@/exercises/parseExerciseLibraryCsv';
import { renderDefaultExercisesModule } from '@/exercises/renderDefaultExercisesModule';
import { bodyParts } from '@/types/BodyPart';
import { trackingTypes } from '@/types/TrackingType';

const header = 'Name,Body Part,Image URL,Tracking,Video URL';

describe('splitCsvLine', () => {
  test('splits plain cells', () => {
    expect(splitCsvLine('a,b,,d')).toEqual(['a', 'b', '', 'd']);
  });

  test('keeps commas inside quotes', () => {
    expect(splitCsvLine('Squat,"https://x.com/a.jpg?crop=1,2",reps')).toEqual([
      'Squat',
      'https://x.com/a.jpg?crop=1,2',
      'reps',
    ]);
  });

  test('unescapes doubled quotes', () => {
    expect(splitCsvLine('"say ""hi""",b')).toEqual(['say "hi"', 'b']);
  });
});

describe('parseExerciseLibraryCsv', () => {
  test('maps body parts, tracking and urls', () => {
    const csvText = [
      header,
      'Chin Ups,back,https://img.com/chin.jpg,reps and sets,https://video.com/chin.mp4',
      'Assisted Pull Ups,back,,assisted reps and sets,',
      'Skull Crusher,tricep,https://img.com/skull.jpg,Weighted Reps And Sets,',
    ].join('\n');

    expect(parseExerciseLibraryCsv(csvText)).toEqual([
      {
        name: 'Chin Ups',
        bodyPart: 'back',
        imageUrl: 'https://img.com/chin.jpg',
        videoUrl: 'https://video.com/chin.mp4',
        defaultTrackingType: 'repetitions',
      },
      {
        name: 'Assisted Pull Ups',
        bodyPart: 'back',
        imageUrl: null,
        videoUrl: null,
        defaultTrackingType: 'repetitions_and_assistance',
      },
      {
        name: 'Skull Crusher',
        bodyPart: 'triceps',
        imageUrl: 'https://img.com/skull.jpg',
        videoUrl: null,
        defaultTrackingType: 'repetitions_and_weight',
      },
    ]);
  });

  test('maps the csv body part spellings', () => {
    const csvText = [
      header,
      'A,quads,,reps and sets,',
      'B,knees,,reps and sets,',
      'C,abs,,reps and sets,',
      'D,grip,,reps and sets,',
      'E,shoulder,,reps and sets,',
      'F,bicep,,reps and sets,',
    ].join('\n');

    expect(parseExerciseLibraryCsv(csvText).map((exercise) => exercise.bodyPart)).toEqual([
      'quadriceps',
      'quadriceps',
      'core',
      'forearms',
      'shoulders',
      'biceps',
    ]);
  });

  test('skips rows without a name', () => {
    const csvText = [header, ',,,,', ',bicep,,weighted reps and sets,', 'Dips,chest,,reps and sets,', ''].join('\n');

    expect(parseExerciseLibraryCsv(csvText).map((exercise) => exercise.name)).toEqual(['Dips']);
  });

  test('rejects an unknown body part', () => {
    expect(() => parseExerciseLibraryCsv([header, 'Dips,legs,,reps and sets,'].join('\n'))).toThrow(
      'Row 2: unknown body part "legs"',
    );
  });

  test('rejects an unknown tracking style', () => {
    expect(() => parseExerciseLibraryCsv([header, 'Dips,chest,,timed,'].join('\n'))).toThrow(
      'Row 2: unknown tracking "timed"',
    );
  });

  test('rejects duplicate names regardless of case', () => {
    const csvText = [header, 'Dips,chest,,reps and sets,', 'dips,chest,,reps and sets,'].join('\n');

    expect(() => parseExerciseLibraryCsv(csvText)).toThrow('Row 3: duplicate exercise "dips"');
  });

  test('rejects a url that is not https', () => {
    expect(() => parseExerciseLibraryCsv([header, 'Dips,chest,http://img.com/a.jpg,reps and sets,'].join('\n'))).toThrow(
      'Row 2: URL must start with https://',
    );
  });
});

describe('default exercise library', () => {
  test('the generated module matches assets/workouts.csv', async () => {
    const csvText = await Bun.file('assets/workouts.csv').text();
    const generatedModule = await Bun.file('src/exercises/defaultExercises.ts').text();

    expect(generatedModule).toBe(renderDefaultExercisesModule(parseExerciseLibraryCsv(csvText)));
  });

  test('every exercise uses a known body part and tracking type', () => {
    for (const exercise of defaultExercises) {
      expect(bodyParts).toContain(exercise.bodyPart);
      expect(trackingTypes).toContain(exercise.defaultTrackingType);
    }
  });
});
