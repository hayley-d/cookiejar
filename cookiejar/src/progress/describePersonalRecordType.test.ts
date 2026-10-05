import { describe, expect, test } from 'bun:test';

import { describePersonalRecordType } from '@/progress/describePersonalRecordType';
import { personalRecordPriority } from '@/progress/detectPersonalRecords';

describe('describePersonalRecordType', () => {
  test('labels every record type', () => {
    for (const recordType of personalRecordPriority) {
      expect(describePersonalRecordType(recordType).length).toBeGreaterThan(0);
    }
    expect(describePersonalRecordType('heaviestWeight')).toBe('Heaviest weight');
  });
});
