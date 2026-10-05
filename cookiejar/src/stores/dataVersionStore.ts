import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let dataVersion = 0;

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToDataVersion(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDataVersion() {
  return dataVersion;
}

export function bumpDataVersion() {
  dataVersion += 1;
  notifyListeners();
}

export function resetDataVersion() {
  dataVersion = 0;
  notifyListeners();
}

export function useDataVersion() {
  return useSyncExternalStore(subscribeToDataVersion, getDataVersion);
}
