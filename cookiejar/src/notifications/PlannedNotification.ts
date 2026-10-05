import type { NuggieName } from '@/nuggies/NuggieName';

export type PlannedNotification = {
  identifier: string;
  title: string;
  body: string;
  nuggie: NuggieName;
  route: string | null;
  fireAt: Date;
  playsSound: boolean;
};
