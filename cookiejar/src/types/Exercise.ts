import type { BodyPart } from '@/types/BodyPart';
import type { TrackingType } from '@/types/TrackingType';

export type Exercise = {
  id: number;
  name: string;
  bodyPart: BodyPart;
  imageUrl: string | null;
  notes: string | null;
  defaultTrackingType: TrackingType;
  createdAt: string;
};
