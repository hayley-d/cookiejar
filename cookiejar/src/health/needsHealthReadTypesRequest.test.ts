import { describe, expect, test } from 'bun:test';

import { needsHealthReadTypesRequest } from '@/health/needsHealthReadTypesRequest';

describe('needsHealthReadTypesRequest', () => {
  test('never requested does not need a re-request', () => {
    expect(needsHealthReadTypesRequest(null, null, 2)).toBe(false);
  });

  test('requested before versions were stored needs a re-request', () => {
    expect(needsHealthReadTypesRequest('2026-10-01T00:00:00.000Z', null, 2)).toBe(true);
  });

  test('an older stored version needs a re-request', () => {
    expect(needsHealthReadTypesRequest('2026-10-01T00:00:00.000Z', '1', 2)).toBe(true);
  });

  test('the current stored version does not need a re-request', () => {
    expect(needsHealthReadTypesRequest('2026-10-01T00:00:00.000Z', '2', 2)).toBe(false);
  });
});
