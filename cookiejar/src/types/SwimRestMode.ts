export type SwimRestMode = 'fixed' | 'send_off';

export const swimRestModes: SwimRestMode[] = ['fixed', 'send_off'];

export const swimRestModeLabels: Record<SwimRestMode, string> = {
  fixed: 'Rest',
  send_off: 'Send-off',
};
