import { describe, expect, test } from 'bun:test';

import { describeHealthAccessStatus } from '@/health/describeHealthAccessStatus';

describe('describeHealthAccessStatus', () => {
  test('describes the status as loading while it is unknown', () => {
    expect(describeHealthAccessStatus(null).caption).toBe('Checking status');
  });

  test('describes a not yet requested state without claiming access', () => {
    const description = describeHealthAccessStatus(false);
    expect(description.caption).toBe('Not connected');
    expect(description.detail).toContain('has not asked');
  });

  test('describes a requested state without claiming access was granted and points to the Health app', () => {
    const description = describeHealthAccessStatus(true);
    expect(description.caption).toBe('Access requested');
    expect(description.detail).toContain('Data Access & Devices');
    expect(description.detail.toLowerCase()).not.toContain('granted');
  });
});
