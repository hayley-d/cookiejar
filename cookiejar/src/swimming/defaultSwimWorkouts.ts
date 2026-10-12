import { hashText } from '@/exercises/renderDefaultExercisesModule';
import type { SwimBlock, SwimSection, SwimSet, SwimWorkoutDetail } from '@/swimming/swimTypes';
import type { SwimEquipment } from '@/types/SwimEquipment';

export type SwimStrokeName =
  | 'Freestyle'
  | 'Backstroke'
  | 'Breaststroke'
  | 'Butterfly'
  | 'Freestyle Kick'
  | 'Backstroke Kick'
  | 'Breaststroke Kick'
  | 'Butterfly Kick'
  | 'Pull'
  | 'Medley'
  | 'Drill';

export type DefaultSwimSet = Omit<SwimSet, 'exerciseId' | 'exerciseName'> & {
  strokeName: SwimStrokeName;
};
export type DefaultSwimBlock = Omit<SwimBlock, 'sets'> & {
  sets: DefaultSwimSet[];
};
export type DefaultSwimSection = Omit<SwimSection, 'blocks'> & {
  blocks: DefaultSwimBlock[];
};
export type DefaultSwimWorkout = Omit<SwimWorkoutDetail, 'sections'> & {
  builtInKey: string;
  name: string;
  sections: DefaultSwimSection[];
};

export type SwimLevel = 'beginner' | 'intermediate' | 'advanced';
export type SwimSession = 'a' | 'b';

type SwimRestOptions = {
  restSeconds?: number;
  sendOffSeconds?: number;
};

type SwimSetOptions = {
  restSeconds?: number;
  sendOffSeconds?: number;
  equipment?: SwimEquipment[];
  notes?: string;
};

const defaultRestSeconds = 20;

const levelLabels: Record<SwimLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const medleyStrokeNames: SwimStrokeName[] = ['Butterfly', 'Backstroke', 'Breaststroke', 'Freestyle'];
const medleyKickNames: SwimStrokeName[] = ['Butterfly Kick', 'Backstroke Kick', 'Breaststroke Kick', 'Freestyle Kick'];

const drillNotes: Partial<Record<SwimStrokeName, string>> = {
  Butterfly: 'single-arm drill',
  Backstroke: 'single-arm drill',
  Breaststroke: '2-kick-1-pull drill',
  Freestyle: 'catch-up drill',
};

export function swimBuiltInKey(level: SwimLevel, week: number | null, session: SwimSession | null): string {
  if (week === null || session === null) {
    return `swim-${level}-recovery`;
  }
  return `swim-${level}-week-${week}-${session}`;
}

export type ParsedSwimBuiltInKey = {
  level: SwimLevel;
  week: number | null;
  session: SwimSession | null;
};

const swimBuiltInKeyPattern = /^swim-(beginner|intermediate|advanced)-(?:recovery|week-([1-9]\d*)-([ab]))$/;

export function parseSwimBuiltInKey(builtInKey: string): ParsedSwimBuiltInKey | null {
  const match = swimBuiltInKeyPattern.exec(builtInKey);
  if (match === null) {
    return null;
  }
  const [, level, week, session] = match;
  return {
    level: level as SwimLevel,
    week: week === undefined ? null : Number(week),
    session: session === undefined ? null : (session as SwimSession),
  };
}

function swimSet(
  strokeName: SwimStrokeName,
  repetitions: number,
  distanceMeters: number,
  options: SwimSetOptions = {},
): DefaultSwimSet {
  const isSendOff = options.sendOffSeconds !== undefined;
  return {
    strokeName,
    repetitions,
    distanceMeters,
    restMode: isSendOff ? 'send_off' : 'fixed',
    restSeconds: isSendOff ? null : (options.restSeconds ?? defaultRestSeconds),
    sendOffSeconds: options.sendOffSeconds ?? null,
    restAfterSeconds: null,
    equipment: [...(options.equipment ?? [])],
    notes: options.notes ?? null,
  };
}

function block(sets: DefaultSwimSet[], rounds = 1): DefaultSwimBlock {
  return { rounds, restAfterSeconds: null, sets };
}

function section(name: string, blocks: DefaultSwimBlock[]): DefaultSwimSection {
  return { name, blocks };
}

const warmUp = (sets: DefaultSwimSet[]) => section('Warm up', [block(sets)]);
const drill = (sets: DefaultSwimSet[]) => section('Drill', [block(sets)]);
const kick = (sets: DefaultSwimSet[]) => section('Kick', [block(sets)]);
const preSet = (sets: DefaultSwimSet[]) => section('Pre-set', [block(sets)]);
const main = (blocks: DefaultSwimBlock[]) => section('Main', blocks);
const coolDown = (sets: DefaultSwimSet[]) => section('Cool down', [block(sets)]);

function cycleStrokes(
  strokeNames: SwimStrokeName[],
  count: number,
  createSet: (strokeName: SwimStrokeName) => DefaultSwimSet[],
): DefaultSwimSet[] {
  return Array.from({ length: count }, (_, index) => createSet(strokeNames[index % strokeNames.length])).flat();
}

function drillSetsInMedleyOrder(count: number, distanceMeters: number, options: SwimSetOptions = {}) {
  return cycleStrokes(medleyStrokeNames, count, (strokeName) => [
    swimSet(strokeName, 1, distanceMeters, {
      ...options,
      notes: drillNotes[strokeName],
    }),
  ]);
}

function drillAndSwimSetsInMedleyOrder(count: number, distanceMeters: number, options: SwimSetOptions = {}) {
  const halfDistanceMeters = distanceMeters / 2;
  return cycleStrokes(medleyStrokeNames, count, (strokeName) => [
    swimSet(strokeName, 1, distanceMeters, {
      ...options,
      notes: `${halfDistanceMeters} ${drillNotes[strokeName]} / ${halfDistanceMeters} swim`,
    }),
  ]);
}

function swimSetsInMedleyOrder(count: number, distanceMeters: number, options: SwimSetOptions = {}) {
  return cycleStrokes(medleyStrokeNames, count, (strokeName) => [swimSet(strokeName, 1, distanceMeters, options)]);
}

export function repeatOf(parts: DefaultSwimSet[], finalRest: SwimRestOptions = {}): DefaultSwimSet[] {
  const finalRestFields = swimSet('Freestyle', 1, 25, finalRest);
  const lastIndex = parts.length - 1;
  return parts.map((part, index) =>
    index === lastIndex
      ? {
          ...part,
          restMode: finalRestFields.restMode,
          restSeconds: finalRestFields.restSeconds,
          sendOffSeconds: finalRestFields.sendOffSeconds,
        }
      : { ...part, restMode: 'fixed', restSeconds: 0, sendOffSeconds: null },
  );
}

function kickSetsInMedleyOrder(count: number, distanceMeters: number, options: SwimSetOptions = {}) {
  return cycleStrokes(medleyKickNames, count, (strokeName) => [
    swimSet(strokeName, 1, distanceMeters, {
      equipment: ['kickboard'],
      ...options,
    }),
  ]);
}

function easyMixedSets(totalDistanceMeters: number): DefaultSwimSet[] {
  return repeatOf([
    swimSet('Freestyle', 1, totalDistanceMeters / 2, { notes: 'easy' }),
    swimSet('Backstroke', 1, totalDistanceMeters / 2, { notes: 'easy' }),
  ]);
}

const continuousOptions: SwimSetOptions = {
  restSeconds: 0,
  notes: 'continuous, no stopping',
};

const beginnerWarmUpStandard = () =>
  warmUp([
    swimSet('Freestyle', 2, 50, { notes: 'easy, RPE 2' }),
    swimSet('Freestyle Kick', 2, 25, { equipment: ['kickboard'] }),
    swimSet('Freestyle', 2, 25, { notes: 'build' }),
  ]);

const beginnerWarmUpBackstroke = () =>
  warmUp([
    swimSet('Freestyle', 2, 50, { notes: 'easy, RPE 2' }),
    swimSet('Backstroke', 2, 25, { notes: 'easy' }),
    swimSet('Freestyle', 2, 25, { notes: 'build' }),
  ]);

const beginnerWarmUpShort = () =>
  warmUp([
    swimSet('Freestyle', 2, 50, { notes: 'easy, RPE 2' }),
    swimSet('Freestyle Kick', 2, 25, { equipment: ['kickboard'] }),
  ]);

const beginnerWarmUpMini = () =>
  warmUp([
    swimSet('Freestyle', 2, 25, { notes: 'easy, RPE 2' }),
    swimSet('Freestyle Kick', 2, 25, { equipment: ['kickboard'] }),
  ]);

const kickBoardSets = (strokeNames: SwimStrokeName[], distanceMeters: number) =>
  strokeNames.map((strokeName) => swimSet(strokeName, 1, distanceMeters, { equipment: ['kickboard'] }));

const finsKickSets = (strokeNames: SwimStrokeName[]) =>
  strokeNames.map((strokeName) => swimSet(strokeName, 1, 25, { equipment: ['fins'] }));

type WorkoutDefinition = {
  level: SwimLevel;
  week: number | null;
  session: SwimSession | null;
  purpose: string | null;
  sections: DefaultSwimSection[];
};

function createWorkout(definition: WorkoutDefinition): DefaultSwimWorkout {
  const levelLabel = levelLabels[definition.level];
  const name =
    definition.week === null || definition.purpose === null
      ? `${levelLabel} · Recovery`
      : `${levelLabel} · Week ${definition.week} · ${definition.purpose}`;
  return {
    builtInKey: swimBuiltInKey(definition.level, definition.week, definition.session),
    name,
    poolLengthMeters: 25,
    sections: definition.sections,
  };
}

const beginnerDefinitions: WorkoutDefinition[] = [
  {
    level: 'beginner',
    week: 1,
    session: 'a',
    purpose: 'Technique',
    sections: [
      beginnerWarmUpStandard(),
      drill(drillSetsInMedleyOrder(4, 25)),
      main([
        block([
          swimSet('Freestyle', 2, 50, { notes: 'RPE 4' }),
          swimSet('Backstroke', 2, 50, { notes: 'RPE 4' }),
          swimSet('Breaststroke', 2, 50, { notes: 'RPE 4' }),
        ]),
      ]),
      coolDown([swimSet('Backstroke', 1, 100, { notes: 'easy' })]),
    ],
  },
  {
    level: 'beginner',
    week: 1,
    session: 'b',
    purpose: 'Endurance',
    sections: [
      beginnerWarmUpStandard(),
      kick(kickBoardSets(['Freestyle Kick', 'Backstroke Kick', 'Breaststroke Kick', 'Butterfly Kick'], 25)),
      main([
        block(
          [swimSet('Freestyle', 1, 100, { restSeconds: 30 }), swimSet('Backstroke', 1, 100, { restSeconds: 30 })],
          2,
        ),
      ]),
      coolDown([swimSet('Breaststroke', 1, 100, { notes: 'easy' })]),
    ],
  },
  {
    level: 'beginner',
    week: 2,
    session: 'a',
    purpose: 'Technique',
    sections: [
      beginnerWarmUpStandard(),
      drill(drillSetsInMedleyOrder(4, 25)),
      main([
        block([
          swimSet('Freestyle', 2, 50),
          swimSet('Backstroke', 2, 50),
          swimSet('Breaststroke', 2, 50),
          swimSet('Freestyle', 2, 50),
        ]),
      ]),
      coolDown([swimSet('Backstroke', 1, 100, { notes: 'easy' })]),
    ],
  },
  {
    level: 'beginner',
    week: 2,
    session: 'b',
    purpose: 'Endurance',
    sections: [
      beginnerWarmUpStandard(),
      section('Kick', [
        block(
          repeatOf([
            swimSet('Breaststroke Kick', 1, 25, { equipment: ['kickboard'] }),
            swimSet('Freestyle Kick', 1, 25, { equipment: ['kickboard'] }),
          ]),
          4,
        ),
      ]),
      main([
        block(
          repeatOf([swimSet('Freestyle', 1, 100), swimSet('Backstroke', 1, 50), swimSet('Breaststroke', 1, 50)], {
            restSeconds: 45,
          }),
          2,
        ),
      ]),
      coolDown(easyMixedSets(100)),
    ],
  },
  {
    level: 'beginner',
    week: 3,
    session: 'a',
    purpose: 'Technique',
    sections: [
      beginnerWarmUpShort(),
      drill(drillSetsInMedleyOrder(4, 25)),
      main([
        block(repeatOf([swimSet('Backstroke', 1, 25), swimSet('Breaststroke', 1, 25), swimSet('Freestyle', 1, 25)]), 6),
        block([
          swimSet('Butterfly Kick', 4, 25, {
            equipment: ['fins'],
            notes: 'on back',
          }),
        ]),
      ]),
      coolDown([swimSet('Backstroke', 1, 100, { notes: 'easy' })]),
    ],
  },
  {
    level: 'beginner',
    week: 3,
    session: 'b',
    purpose: 'Endurance',
    sections: [
      beginnerWarmUpStandard(),
      kick(kickSetsInMedleyOrder(4, 25)),
      main([
        block([swimSet('Freestyle', 1, 100, continuousOptions), swimSet('Backstroke', 1, 100, continuousOptions)], 2),
        block([swimSet('Breaststroke', 4, 50, { notes: 'RPE 5' })]),
      ]),
      coolDown(easyMixedSets(100)),
    ],
  },
  {
    level: 'beginner',
    week: 4,
    session: 'a',
    purpose: 'Easy',
    sections: [
      beginnerWarmUpMini(),
      drill(
        cycleStrokes(medleyStrokeNames, 4, (strokeName) => [
          swimSet(strokeName, 2, 25, {
            notes: `${drillNotes[strokeName]}, then swim`,
          }),
        ]),
      ),
      main([block([swimSet('Backstroke', 4, 50, { notes: 'RPE 3' })])]),
      coolDown(easyMixedSets(100)),
    ],
  },
  {
    level: 'beginner',
    week: 4,
    session: 'b',
    purpose: 'Easy kick',
    sections: [
      beginnerWarmUpStandard(),
      kick(finsKickSets(['Butterfly Kick', 'Backstroke Kick', 'Freestyle Kick', 'Backstroke Kick'])),
      main([
        block([
          swimSet('Freestyle', 1, 100, { restSeconds: 30, notes: 'RPE 3' }),
          swimSet('Backstroke', 1, 100, { restSeconds: 30, notes: 'RPE 3' }),
          swimSet('Breaststroke', 1, 100, { restSeconds: 30, notes: 'RPE 3' }),
        ]),
      ]),
      coolDown(easyMixedSets(100)),
    ],
  },
  {
    level: 'beginner',
    week: 5,
    session: 'a',
    purpose: 'Aerobic',
    sections: [
      beginnerWarmUpBackstroke(),
      drill(drillSetsInMedleyOrder(4, 25)),
      main([
        block([swimSet('Freestyle', 1, 100), swimSet('Pull', 1, 100, { equipment: ['pull_buoy'] })], 2),
        block(
          repeatOf([
            swimSet('Butterfly', 1, 25, { equipment: ['fins'] }),
            swimSet('Freestyle', 1, 25, { equipment: ['fins'] }),
          ]),
          4,
        ),
      ]),
      coolDown([swimSet('Backstroke', 1, 100, { notes: 'easy' })]),
    ],
  },
  {
    level: 'beginner',
    week: 5,
    session: 'b',
    purpose: 'Endurance',
    sections: [
      beginnerWarmUpBackstroke(),
      kick(finsKickSets(['Butterfly Kick', 'Backstroke Kick', 'Freestyle Kick', 'Butterfly Kick'])),
      main([
        block([
          swimSet('Freestyle', 1, 200, continuousOptions),
          swimSet('Backstroke', 1, 200, continuousOptions),
          swimSet('Breaststroke', 1, 200, continuousOptions),
        ]),
        block([swimSet('Butterfly', 4, 25, { equipment: ['fins'], notes: 'build' })]),
      ]),
      coolDown(easyMixedSets(100)),
    ],
  },
  {
    level: 'beginner',
    week: 6,
    session: 'a',
    purpose: 'IM aerobic',
    sections: [
      beginnerWarmUpBackstroke(),
      drill(drillAndSwimSetsInMedleyOrder(4, 50)),
      main([block([swimSet('Medley', 4, 100)]), block(kickSetsInMedleyOrder(4, 25))]),
      coolDown([swimSet('Backstroke', 1, 100, { notes: 'easy' })]),
    ],
  },
  {
    level: 'beginner',
    week: 6,
    session: 'b',
    purpose: 'Endurance',
    sections: [
      beginnerWarmUpBackstroke(),
      kick(finsKickSets(['Butterfly Kick', 'Backstroke Kick', 'Freestyle Kick', 'Backstroke Kick'])),
      main([
        block(
          [
            swimSet('Freestyle', 1, 100, continuousOptions),
            swimSet('Backstroke', 1, 100, continuousOptions),
            swimSet('Freestyle', 1, 100, continuousOptions),
            swimSet('Breaststroke', 1, 100, continuousOptions),
          ],
          2,
        ),
      ]),
      coolDown(easyMixedSets(100)),
    ],
  },
  {
    level: 'beginner',
    week: null,
    session: null,
    purpose: null,
    sections: [
      beginnerWarmUpMini(),
      drill(drillSetsInMedleyOrder(4, 25)),
      main([
        block([
          swimSet('Backstroke', 1, 50, { notes: 'RPE 2' }),
          swimSet('Breaststroke', 1, 50, { notes: 'RPE 2' }),
          swimSet('Backstroke', 1, 50, { notes: 'RPE 2' }),
          swimSet('Breaststroke', 1, 50, { notes: 'RPE 2' }),
        ]),
      ]),
      coolDown([swimSet('Freestyle', 1, 100, { notes: 'easy' })]),
    ],
  },
];

const intermediateWarmUp300 = () =>
  warmUp([
    swimSet('Freestyle', 1, 100, { notes: 'easy' }),
    swimSet('Backstroke', 1, 50),
    swimSet('Breaststroke', 1, 50),
    ...kickSetsInMedleyOrder(4, 25),
  ]);

const intermediateWarmUp400 = () =>
  warmUp([
    swimSet('Freestyle', 1, 200, { notes: 'easy' }),
    ...swimSetsInMedleyOrder(4, 25),
    swimSet('Freestyle', 4, 25, { notes: 'build' }),
  ]);

const cssTestBlock = () =>
  block([
    swimSet('Freestyle', 1, 400, {
      restSeconds: 0,
      notes: 'time trial, record your time',
    }),
    swimSet('Backstroke', 1, 200, { restSeconds: 0, notes: 'easy' }),
    swimSet('Freestyle', 1, 200, {
      restSeconds: 0,
      notes: 'time trial, record your time',
    }),
  ]);

const intermediateCssTestSections = () => [
  intermediateWarmUp400(),
  preSet([swimSet('Freestyle', 6, 50, { restSeconds: 15, notes: 'build' })]),
  main([cssTestBlock()]),
  coolDown([swimSet('Backstroke', 1, 100), swimSet('Breaststroke', 1, 100), swimSet('Freestyle', 1, 100)]),
];

const intermediateDefinitions: WorkoutDefinition[] = [
  {
    level: 'intermediate',
    week: 1,
    session: 'a',
    purpose: 'Aerobic',
    sections: [
      intermediateWarmUp300(),
      drill(drillAndSwimSetsInMedleyOrder(6, 50)),
      main([
        block(
          repeatOf([
            swimSet('Freestyle', 1, 100, { notes: 'RPE 5' }),
            swimSet('Backstroke', 1, 100, { notes: 'RPE 5' }),
            swimSet('Breaststroke', 1, 100, { notes: 'RPE 5' }),
          ]),
          3,
        ),
      ]),
      coolDown([swimSet('Backstroke', 4, 50, { notes: 'easy' }), swimSet('Freestyle', 1, 100, { notes: 'easy' })]),
    ],
  },
  {
    level: 'intermediate',
    week: 1,
    session: 'b',
    purpose: 'CSS test',
    sections: intermediateCssTestSections(),
  },
  {
    level: 'intermediate',
    week: 2,
    session: 'a',
    purpose: 'Aerobic',
    sections: [
      intermediateWarmUp300(),
      drill(drillAndSwimSetsInMedleyOrder(6, 50)),
      main([
        block(repeatOf([swimSet('Freestyle', 1, 200), swimSet('Backstroke', 1, 100)])),
        block(repeatOf([swimSet('Freestyle', 1, 200), swimSet('Breaststroke', 1, 100)])),
        block(repeatOf([swimSet('Freestyle', 1, 200), swimSet('Backstroke', 1, 100)])),
        block(repeatOf([swimSet('Freestyle', 1, 200), swimSet('Butterfly', 1, 50), swimSet('Freestyle', 1, 50)])),
      ]),
      coolDown([swimSet('Backstroke', 1, 200, { notes: 'easy' })]),
    ],
  },
  {
    level: 'intermediate',
    week: 2,
    session: 'b',
    purpose: 'Threshold',
    sections: [
      intermediateWarmUp400(),
      preSet([
        swimSet('Backstroke', 6, 50, {
          restSeconds: 15,
          notes: 'descend 1-3, twice',
        }),
      ]),
      main([
        block([
          swimSet('Freestyle', 10, 100, {
            restSeconds: 15,
            notes: 'at CSS pace',
          }),
        ]),
      ]),
      coolDown([
        swimSet('Breaststroke', 1, 200, { notes: 'easy' }),
        swimSet('Pull', 1, 100, { equipment: ['pull_buoy'] }),
      ]),
    ],
  },
  {
    level: 'intermediate',
    week: 3,
    session: 'a',
    purpose: 'Endurance',
    sections: [
      intermediateWarmUp300(),
      drill(drillAndSwimSetsInMedleyOrder(6, 50)),
      main([
        block(
          [
            swimSet('Freestyle', 1, 200),
            swimSet('Pull', 1, 100, { equipment: ['pull_buoy'] }),
            swimSet('Backstroke', 1, 100),
          ],
          3,
        ),
        block(kickSetsInMedleyOrder(4, 50)),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'intermediate',
    week: 3,
    session: 'b',
    purpose: 'Speed',
    sections: [
      intermediateWarmUp400(),
      preSet(swimSetsInMedleyOrder(8, 25, { sendOffSeconds: 40, notes: 'build' })),
      main([
        block(
          [
            swimSet('Freestyle', 4, 50, { sendOffSeconds: 75, notes: 'fast' }),
            swimSet('Backstroke', 1, 100, { notes: 'easy' }),
          ],
          3,
        ),
        block(kickSetsInMedleyOrder(4, 50)),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'intermediate',
    week: 4,
    session: 'a',
    purpose: 'Easy',
    sections: [
      intermediateWarmUp300(),
      drill(drillAndSwimSetsInMedleyOrder(8, 50)),
      main([
        block([
          swimSet('Backstroke', 2, 100, { notes: 'RPE 4' }),
          swimSet('Breaststroke', 2, 100, { notes: 'RPE 4' }),
          swimSet('Freestyle', 2, 100, { notes: 'RPE 4' }),
        ]),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'intermediate',
    week: 4,
    session: 'b',
    purpose: 'Easy pull',
    sections: [
      intermediateWarmUp400(),
      drill(drillSetsInMedleyOrder(4, 50)),
      main([
        block([swimSet('Backstroke', 6, 50, { notes: 'descend' })]),
        block([swimSet('Pull', 4, 100, { equipment: ['pull_buoy'], notes: 'easy' })]),
      ]),
      coolDown(easyMixedSets(300)),
    ],
  },
  {
    level: 'intermediate',
    week: 5,
    session: 'a',
    purpose: 'Endurance',
    sections: [
      intermediateWarmUp400(),
      drill(drillAndSwimSetsInMedleyOrder(6, 50)),
      main([
        block(
          repeatOf(
            [
              swimSet('Freestyle', 1, 200),
              swimSet('Backstroke', 1, 100),
              swimSet('Freestyle', 1, 200),
              swimSet('Breaststroke', 1, 100),
            ],
            { restSeconds: 30 },
          ),
          2,
        ),
        block(kickSetsInMedleyOrder(6, 50)),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'intermediate',
    week: 5,
    session: 'b',
    purpose: 'Threshold',
    sections: [
      intermediateWarmUp400(),
      preSet([swimSet('Freestyle', 6, 50, { restSeconds: 15, notes: 'descend' })]),
      main([
        block([swimSet('Freestyle', 5, 200, { notes: 'at CSS pace' })]),
        block([swimSet('Medley', 4, 100, { notes: 'RPE 5' })]),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'intermediate',
    week: 6,
    session: 'a',
    purpose: 'IM aerobic',
    sections: [
      intermediateWarmUp300(),
      drill(drillSetsInMedleyOrder(4, 50)),
      main([
        block([swimSet('Medley', 4, 200, { notes: 'RPE 5' })]),
        block([swimSet('Backstroke', 1, 100), swimSet('Breaststroke', 1, 100)], 2),
      ]),
      coolDown(easyMixedSets(300)),
    ],
  },
  {
    level: 'intermediate',
    week: 6,
    session: 'b',
    purpose: 'CSS test',
    sections: intermediateCssTestSections(),
  },
  {
    level: 'intermediate',
    week: null,
    session: null,
    purpose: null,
    sections: [
      warmUp([
        swimSet('Freestyle', 1, 100, { notes: 'easy' }),
        swimSet('Backstroke', 1, 50),
        swimSet('Breaststroke', 1, 50),
      ]),
      drill(drillAndSwimSetsInMedleyOrder(8, 50)),
      main([
        block(
          [swimSet('Backstroke', 1, 100, { notes: 'RPE 2' }), swimSet('Breaststroke', 1, 100, { notes: 'RPE 2' })],
          2,
        ),
      ]),
      coolDown(easyMixedSets(100)),
    ],
  },
];

const advancedWarmUp600 = () =>
  warmUp([swimSet('Freestyle', 1, 200, { notes: 'easy' }), swimSet('Medley', 1, 200), ...kickSetsInMedleyOrder(4, 50)]);

const advancedDefinitions: WorkoutDefinition[] = [
  {
    level: 'advanced',
    week: 1,
    session: 'a',
    purpose: 'Aerobic',
    sections: [
      advancedWarmUp600(),
      drill(drillAndSwimSetsInMedleyOrder(8, 50, { sendOffSeconds: 50 })),
      main([
        block(
          repeatOf([
            swimSet('Freestyle', 1, 300, { notes: 'RPE 5' }),
            swimSet('Backstroke', 1, 200, { notes: 'RPE 5' }),
          ]),
          3,
        ),
        block([swimSet('Butterfly Kick', 4, 50, { equipment: ['fins'] })]),
      ]),
      coolDown(easyMixedSets(300)),
    ],
  },
  {
    level: 'advanced',
    week: 1,
    session: 'b',
    purpose: 'CSS test',
    sections: [
      advancedWarmUp600(),
      preSet([swimSet('Freestyle', 8, 50, { sendOffSeconds: 50, notes: 'build' })]),
      main([cssTestBlock(), block([swimSet('Backstroke', 4, 50, { notes: 'easy' })])]),
      coolDown(easyMixedSets(400)),
    ],
  },
  {
    level: 'advanced',
    week: 2,
    session: 'a',
    purpose: 'Pull',
    sections: [
      advancedWarmUp600(),
      preSet([
        swimSet('Medley', 4, 100, {
          sendOffSeconds: 110,
          notes: 'drill, IM order',
        }),
      ]),
      main([
        block([
          swimSet('Pull', 4, 400, {
            equipment: ['pull_buoy', 'paddles'],
            notes: 'RPE 6',
          }),
        ]),
        block([
          swimSet('Backstroke', 4, 100, {
            sendOffSeconds: 105,
            notes: 'descend',
          }),
        ]),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'advanced',
    week: 2,
    session: 'b',
    purpose: 'Threshold',
    sections: [
      advancedWarmUp600(),
      preSet([swimSet('Freestyle', 8, 50, { sendOffSeconds: 50, notes: 'descend' })]),
      main([
        block([
          swimSet('Freestyle', 12, 100, {
            restSeconds: 10,
            notes: 'at CSS pace',
          }),
        ]),
        block(kickSetsInMedleyOrder(8, 50, { sendOffSeconds: 70 })),
      ]),
      coolDown([swimSet('Backstroke', 1, 200, { notes: 'easy' }), swimSet('Breaststroke', 1, 200, { notes: 'easy' })]),
    ],
  },
  {
    level: 'advanced',
    week: 3,
    session: 'a',
    purpose: 'IM aerobic',
    sections: [
      warmUp([swimSet('Freestyle', 1, 200, { notes: 'easy' }), swimSet('Medley', 1, 200)]),
      drill(drillAndSwimSetsInMedleyOrder(8, 50)),
      main([
        block(
          repeatOf([swimSet('Freestyle', 1, 400, { notes: 'RPE 5' }), swimSet('Medley', 1, 400, { notes: 'RPE 5' })], {
            restSeconds: 30,
          }),
          3,
        ),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'advanced',
    week: 3,
    session: 'b',
    purpose: 'Sprint',
    sections: [
      advancedWarmUp600(),
      section('Kick', [
        block(
          cycleStrokes(['Butterfly Kick', 'Backstroke Kick', 'Freestyle Kick'], 8, (strokeName) => [
            swimSet(strokeName, 1, 50, {
              sendOffSeconds: 60,
              equipment: ['fins'],
            }),
          ]),
        ),
      ]),
      main([
        block(
          [
            swimSet('Freestyle', 4, 50, {
              sendOffSeconds: 90,
              notes: 'max effort',
            }),
            swimSet('Pull', 1, 200, {
              equipment: ['pull_buoy'],
              notes: 'easy',
            }),
          ],
          3,
        ),
        block(
          cycleStrokes(medleyStrokeNames, 4, (strokeName) => [
            swimSet(strokeName, 2, 25, { sendOffSeconds: 45, notes: 'sprint' }),
          ]),
        ),
      ]),
      coolDown(easyMixedSets(400)),
    ],
  },
  {
    level: 'advanced',
    week: 4,
    session: 'a',
    purpose: 'Easy',
    sections: [
      warmUp([
        swimSet('Freestyle', 1, 200, { notes: 'easy' }),
        swimSet('Medley', 1, 200),
        ...kickSetsInMedleyOrder(4, 25),
      ]),
      drill(drillAndSwimSetsInMedleyOrder(8, 50)),
      main([
        block([swimSet('Freestyle', 1, 200, { notes: 'RPE 4' }), swimSet('Backstroke', 1, 200, { notes: 'RPE 4' })], 3),
        block(kickSetsInMedleyOrder(4, 50)),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'advanced',
    week: 4,
    session: 'b',
    purpose: 'Easy build',
    sections: [
      advancedWarmUp600(),
      drill(drillAndSwimSetsInMedleyOrder(8, 50)),
      main([
        ...medleyStrokeNames.map((strokeName) =>
          block([swimSet(strokeName, 3, 50, { notes: 'build' }), swimSet(strokeName, 1, 50, { notes: 'easy' })]),
        ),
        block([swimSet('Pull', 4, 100, { equipment: ['pull_buoy'], notes: 'easy' })]),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
  {
    level: 'advanced',
    week: 5,
    session: 'a',
    purpose: 'Endurance',
    sections: [
      advancedWarmUp600(),
      drill(drillAndSwimSetsInMedleyOrder(8, 50, { sendOffSeconds: 50 })),
      main([
        block(
          repeatOf(
            [
              swimSet('Freestyle', 1, 400),
              swimSet('Backstroke', 1, 200),
              swimSet('Breaststroke', 1, 200),
              swimSet('Freestyle', 1, 200),
            ],
            { restSeconds: 45 },
          ),
          2,
        ),
        block(kickSetsInMedleyOrder(6, 50)),
      ]),
      coolDown(easyMixedSets(300)),
    ],
  },
  {
    level: 'advanced',
    week: 5,
    session: 'b',
    purpose: 'Threshold',
    sections: [
      advancedWarmUp600(),
      preSet([swimSet('Freestyle', 8, 50, { sendOffSeconds: 50, notes: 'descend' })]),
      main([
        block([swimSet('Freestyle', 4, 400, { notes: 'at CSS + 2 s per 100' })]),
        block([swimSet('Butterfly Kick', 4, 50, { equipment: ['fins'] })]),
      ]),
      coolDown(easyMixedSets(400)),
    ],
  },
  {
    level: 'advanced',
    week: 6,
    session: 'a',
    purpose: 'IM aerobic',
    sections: [
      advancedWarmUp600(),
      preSet([
        swimSet('Medley', 4, 100, {
          sendOffSeconds: 110,
          notes: 'drill, IM order',
        }),
      ]),
      main([
        block([swimSet('Medley', 3, 400, { notes: 'RPE 5' })]),
        block([swimSet('Backstroke', 1, 100), swimSet('Breaststroke', 1, 100)], 2),
      ]),
      coolDown(easyMixedSets(400)),
    ],
  },
  {
    level: 'advanced',
    week: 6,
    session: 'b',
    purpose: 'CSS test',
    sections: [
      advancedWarmUp600(),
      preSet([swimSet('Freestyle', 8, 50, { notes: 'build' })]),
      main([cssTestBlock(), block([swimSet('Pull', 8, 50, { equipment: ['pull_buoy'], notes: 'easy' })])]),
      coolDown(easyMixedSets(400)),
    ],
  },
  {
    level: 'advanced',
    week: null,
    session: null,
    purpose: null,
    sections: [
      warmUp([swimSet('Freestyle', 1, 200, { notes: 'easy' }), swimSet('Backstroke', 1, 200)]),
      drill(drillAndSwimSetsInMedleyOrder(8, 50)),
      main([
        block(
          [swimSet('Backstroke', 1, 100, { notes: 'RPE 2' }), swimSet('Breaststroke', 1, 100, { notes: 'RPE 2' })],
          3,
        ),
        block(
          (['Backstroke Kick', 'Freestyle Kick', 'Backstroke Kick', 'Freestyle Kick'] as SwimStrokeName[]).map(
            (strokeName) => swimSet(strokeName, 1, 50, { equipment: ['fins'] }),
          ),
        ),
      ]),
      coolDown(easyMixedSets(200)),
    ],
  },
];

export const defaultSwimWorkouts: DefaultSwimWorkout[] = [
  ...beginnerDefinitions,
  ...intermediateDefinitions,
  ...advancedDefinitions,
].map(createWorkout);

export const defaultSwimWorkoutLibraryVersion = hashText(JSON.stringify(defaultSwimWorkouts));
