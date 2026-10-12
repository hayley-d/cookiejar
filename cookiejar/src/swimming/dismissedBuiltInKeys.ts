export const dismissedBuiltInKeysSettingKey = 'dismissed_built_in_swim_keys';

export function parseDismissedBuiltInKeys(storedValue: string | null): string[] {
  if (storedValue === null) {
    return [];
  }
  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }
    return parsedValue.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

export function serializeDismissedBuiltInKeys(dismissedKeys: string[]): string {
  return JSON.stringify([...new Set(dismissedKeys)]);
}
