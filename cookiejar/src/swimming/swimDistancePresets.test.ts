import { describe, expect, test } from 'bun:test';

import { swimDistancePresets } from '@/swimming/swimDistancePresets';

describe('swimDistancePresets', () => {
  test('a 25 m pool steps by 25 up to 100 then jumps to long distances', () => {
    expect(swimDistancePresets(25)).toEqual([25, 50, 75, 100, 200, 400, 800]);
  });

  test('a 50 m pool starts at 50', () => {
    expect(swimDistancePresets(50)).toEqual([50, 100, 200, 400, 800]);
  });
});
