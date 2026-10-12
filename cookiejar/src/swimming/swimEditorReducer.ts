import type { SwimBlock, SwimSection, SwimSet } from '@/swimming/swimTypes';
import { defaultSwimPoolLength, type SwimPoolLength } from '@/types/SwimPoolLength';

export type EditorSwimSet = SwimSet & { key: string };

export type EditorSwimBlock = Omit<SwimBlock, 'sets'> & { key: string; sets: EditorSwimSet[] };

export type EditorSwimSection = Omit<SwimSection, 'blocks'> & { key: string; blocks: EditorSwimBlock[] };

export type SwimDetails = {
  poolLengthMeters: SwimPoolLength;
  description: string;
  imageUrl: string;
  sections: EditorSwimSection[];
};

export type LoadedSwimDetails = {
  poolLengthMeters: SwimPoolLength;
  description: string;
  imageUrl: string;
  sections: SwimSection[];
};

export type SwimStroke = { id: number; name: string };

export type SwimSetChanges = Partial<SwimSet>;

export type SwimEditorAction =
  | { type: 'detailsChanged'; changes: Partial<Pick<SwimDetails, 'poolLengthMeters' | 'description' | 'imageUrl'>> }
  | { type: 'sectionAdded' }
  | { type: 'sectionRenamed'; sectionKey: string; name: string }
  | { type: 'sectionRemoved'; sectionKey: string }
  | { type: 'sectionMoved'; sectionKey: string; offset: -1 | 1 }
  | { type: 'setAdded'; sectionKey: string; stroke: SwimStroke }
  | { type: 'setAddedToBlock'; blockKey: string }
  | { type: 'blockRoundsChanged'; blockKey: string; rounds: number }
  | { type: 'blockRestChanged'; blockKey: string; restAfterSeconds: number | null }
  | { type: 'setChanged'; setKey: string; changes: SwimSetChanges }
  | { type: 'setRemoved'; setKey: string };

export type CreateSwimKey = () => string;

export const defaultSwimSectionNames = ['Warm up', 'Main', 'Cool down'];

export const defaultSwimSetValues = {
  repetitions: 1,
  distanceMeters: 100,
};

export function createDefaultSwimDetails(createKey: CreateSwimKey): SwimDetails {
  return {
    poolLengthMeters: defaultSwimPoolLength,
    description: '',
    imageUrl: '',
    sections: defaultSwimSectionNames.map((name) => ({ key: createKey(), name, blocks: [] })),
  };
}

export function loadSwimDetails(loadedDetails: LoadedSwimDetails, createKey: CreateSwimKey): SwimDetails {
  return {
    poolLengthMeters: loadedDetails.poolLengthMeters,
    description: loadedDetails.description,
    imageUrl: loadedDetails.imageUrl,
    sections: loadedDetails.sections.map((section) => ({
      key: createKey(),
      name: section.name,
      blocks: section.blocks.map((block) => ({
        key: createKey(),
        rounds: block.rounds,
        restAfterSeconds: block.restAfterSeconds,
        sets: block.sets.map((set) => ({ ...set, equipment: [...set.equipment], key: createKey() })),
      })),
    })),
  };
}

export function normalizeSwimSectionName(name: string, sectionIndex: number): string {
  const trimmedName = name.trim();
  return trimmedName.length === 0 ? `Section ${sectionIndex + 1}` : trimmedName;
}

function normalizeSwimNotes(notes: string | null): string | null {
  const trimmedNotes = notes?.trim() ?? '';
  return trimmedNotes.length === 0 ? null : trimmedNotes;
}

export function stripSwimKeys(details: SwimDetails): SwimSection[] {
  return details.sections.map((section, sectionIndex) => ({
    name: normalizeSwimSectionName(section.name, sectionIndex),
    blocks: section.blocks.map((block) => ({
      rounds: block.rounds,
      restAfterSeconds: block.restAfterSeconds,
      sets: block.sets.map((set) => ({
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        repetitions: set.repetitions,
        distanceMeters: set.distanceMeters,
        restMode: set.restMode,
        restSeconds: set.restSeconds,
        sendOffSeconds: set.sendOffSeconds,
        restAfterSeconds: set.restAfterSeconds,
        equipment: [...set.equipment],
        notes: normalizeSwimNotes(set.notes),
      })),
    })),
  }));
}

export function findSwimSet(details: SwimDetails, setKey: string): EditorSwimSet | null {
  for (const section of details.sections) {
    for (const block of section.blocks) {
      const foundSet = block.sets.find((set) => set.key === setKey);
      if (foundSet !== undefined) {
        return foundSet;
      }
    }
  }
  return null;
}

function mapSets(details: SwimDetails, update: (set: EditorSwimSet) => EditorSwimSet): SwimDetails {
  return {
    ...details,
    sections: details.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => ({ ...block, sets: block.sets.map(update) })),
    })),
  };
}

function mapBlocks(details: SwimDetails, update: (block: EditorSwimBlock) => EditorSwimBlock): SwimDetails {
  return {
    ...details,
    sections: details.sections.map((section) => ({ ...section, blocks: section.blocks.map(update) })),
  };
}

function normalizeRestAfterSeconds(restAfterSeconds: number | null): number | null {
  return restAfterSeconds === null || restAfterSeconds <= 0 ? null : restAfterSeconds;
}

function withoutStaleBlockRest(block: EditorSwimBlock): EditorSwimBlock {
  const isPlainBlock = block.rounds === 1 && block.sets.length <= 1;
  return isPlainBlock ? { ...block, restAfterSeconds: null } : block;
}

function hasBlock(details: SwimDetails, blockKey: string): boolean {
  return details.sections.some((section) => section.blocks.some((block) => block.key === blockKey));
}

function lastSetOf(section: EditorSwimSection): EditorSwimSet | undefined {
  return section.blocks.at(-1)?.sets.at(-1);
}

export function createSwimEditorReducer(createKey: CreateSwimKey) {
  function createFollowingSet(previousSet: EditorSwimSet | undefined, stroke: SwimStroke): EditorSwimSet {
    return {
      key: createKey(),
      exerciseId: previousSet?.exerciseId ?? stroke.id,
      exerciseName: previousSet?.exerciseName ?? stroke.name,
      repetitions: previousSet?.repetitions ?? defaultSwimSetValues.repetitions,
      distanceMeters: previousSet?.distanceMeters ?? defaultSwimSetValues.distanceMeters,
      restMode: previousSet?.restMode ?? 'fixed',
      restSeconds: previousSet?.restSeconds ?? null,
      sendOffSeconds: previousSet?.sendOffSeconds ?? null,
      restAfterSeconds: null,
      equipment: [],
      notes: null,
    };
  }

  return function swimEditorReducer(details: SwimDetails, action: SwimEditorAction): SwimDetails {
    switch (action.type) {
      case 'detailsChanged':
        return { ...details, ...action.changes };
      case 'sectionAdded':
        return {
          ...details,
          sections: [
            ...details.sections,
            { key: createKey(), name: `Section ${details.sections.length + 1}`, blocks: [] },
          ],
        };
      case 'sectionRenamed':
        return {
          ...details,
          sections: details.sections.map((section) =>
            section.key === action.sectionKey ? { ...section, name: action.name } : section,
          ),
        };
      case 'sectionRemoved': {
        const remainingSections = details.sections.filter((section) => section.key !== action.sectionKey);
        return remainingSections.length === details.sections.length ? details : { ...details, sections: remainingSections };
      }
      case 'sectionMoved': {
        const sectionIndex = details.sections.findIndex((section) => section.key === action.sectionKey);
        const targetIndex = sectionIndex + action.offset;
        if (sectionIndex === -1 || targetIndex < 0 || targetIndex >= details.sections.length) {
          return details;
        }
        const reorderedSections = [...details.sections];
        [reorderedSections[sectionIndex], reorderedSections[targetIndex]] = [
          reorderedSections[targetIndex],
          reorderedSections[sectionIndex],
        ];
        return { ...details, sections: reorderedSections };
      }
      case 'setAdded': {
        const targetSection = details.sections.find((section) => section.key === action.sectionKey);
        if (targetSection === undefined) {
          return details;
        }
        const newSet = createFollowingSet(lastSetOf(targetSection), action.stroke);
        const newBlock: EditorSwimBlock = { key: createKey(), rounds: 1, restAfterSeconds: null, sets: [newSet] };
        return {
          ...details,
          sections: details.sections.map((section) =>
            section.key === action.sectionKey ? { ...section, blocks: [...section.blocks, newBlock] } : section,
          ),
        };
      }
      case 'setAddedToBlock':
        if (!hasBlock(details, action.blockKey)) {
          return details;
        }
        return mapBlocks(details, (block) =>
          block.key === action.blockKey && block.sets.length > 0
            ? {
                ...block,
                sets: [
                  ...block.sets,
                  createFollowingSet(block.sets.at(-1), { id: block.sets[0].exerciseId, name: block.sets[0].exerciseName }),
                ],
              }
            : block,
        );
      case 'blockRoundsChanged':
        return mapBlocks(details, (block) =>
          block.key === action.blockKey
            ? withoutStaleBlockRest({ ...block, rounds: Math.max(1, Math.floor(action.rounds)) })
            : block,
        );
      case 'blockRestChanged':
        return mapBlocks(details, (block) =>
          block.key === action.blockKey ? { ...block, restAfterSeconds: normalizeRestAfterSeconds(action.restAfterSeconds) } : block,
        );
      case 'setChanged':
        if (findSwimSet(details, action.setKey) === null) {
          return details;
        }
        return mapSets(details, (set) => {
          if (set.key !== action.setKey) {
            return set;
          }
          const changedSet = { ...set, ...action.changes };
          return {
            ...changedSet,
            restSeconds: normalizeRestAfterSeconds(changedSet.restSeconds),
            restAfterSeconds: normalizeRestAfterSeconds(changedSet.restAfterSeconds),
          };
        });
      case 'setRemoved':
        if (findSwimSet(details, action.setKey) === null) {
          return details;
        }
        return {
          ...details,
          sections: details.sections.map((section) => ({
            ...section,
            blocks: section.blocks
              .map((block) => withoutStaleBlockRest({ ...block, sets: block.sets.filter((set) => set.key !== action.setKey) }))
              .filter((block) => block.sets.length > 0),
          })),
        };
    }
  };
}
