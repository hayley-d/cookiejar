import type { SwimEquipment } from '@/types/SwimEquipment';
import type { SwimPoolLength } from '@/types/SwimPoolLength';
import type { SwimRestMode } from '@/types/SwimRestMode';

export type SwimSet = {
  exerciseId: number;
  exerciseName: string;
  repetitions: number;
  distanceMeters: number;
  restMode: SwimRestMode;
  restSeconds: number | null;
  sendOffSeconds: number | null;
  restAfterSeconds: number | null;
  equipment: SwimEquipment[];
  notes: string | null;
};

export type SwimBlock = {
  rounds: number;
  restAfterSeconds: number | null;
  sets: SwimSet[];
};

export type SwimSection = {
  name: string;
  blocks: SwimBlock[];
};

export type SwimWorkoutDetail = {
  poolLengthMeters: SwimPoolLength;
  sections: SwimSection[];
};
