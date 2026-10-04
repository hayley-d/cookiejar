import type { NuggieName } from '@/nuggies/NuggieName';

export type AppNotification = {
  id: number;
  title: string;
  body: string;
  nuggie: NuggieName;
  route: string | null;
  createdAt: string;
  readAt: string | null;
};
