export type SwimEquipment = 'fins' | 'paddles' | 'pull_buoy' | 'kickboard';

export const swimEquipmentList: SwimEquipment[] = ['fins', 'paddles', 'pull_buoy', 'kickboard'];

export const swimEquipmentLabels: Record<SwimEquipment, string> = {
  fins: 'Fins',
  paddles: 'Paddles',
  pull_buoy: 'Pull Buoy',
  kickboard: 'Kickboard',
};
