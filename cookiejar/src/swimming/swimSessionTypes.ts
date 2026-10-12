import type { SwimEquipment } from '@/types/SwimEquipment';
import type { SwimPoolLength } from '@/types/SwimPoolLength';
import type { SwimRestMode } from '@/types/SwimRestMode';

export type SwimSessionRepetition = {
  id: number;
  roundIndex: number;
  repetitionIndex: number;
  completedAt: string | null;
};

export type SwimSessionSet = {
  id: number;
  exerciseId: number | null;
  exerciseName: string;
  repetitions: number;
  distanceMeters: number;
  restMode: SwimRestMode;
  restSeconds: number | null;
  sendOffSeconds: number | null;
  restAfterSeconds: number | null;
  equipment: SwimEquipment[];
  notes: string | null;
  repetitionRows: SwimSessionRepetition[];
};

export type SwimSessionBlock = {
  id: number;
  rounds: number;
  restAfterSeconds: number | null;
  sets: SwimSessionSet[];
};

export type SwimSessionSection = {
  id: number;
  name: string;
  blocks: SwimSessionBlock[];
};

export type SwimSessionDetail = {
  poolLengthMeters: SwimPoolLength;
  sections: SwimSessionSection[];
};
