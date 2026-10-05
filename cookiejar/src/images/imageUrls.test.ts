import { describe, expect, test } from 'bun:test';

import { imageUrlError, imageUrlToStore, isPreviewableImageUrl } from '@/images/imageUrls';

describe('isPreviewableImageUrl', () => {
  test('a valid https URL can be previewed', () => {
    expect(isPreviewableImageUrl(' https://example.com/squat.jpg ')).toBe(true);
  });

  test('an empty URL cannot be previewed', () => {
    expect(isPreviewableImageUrl('')).toBe(false);
  });

  test('an incomplete URL cannot be previewed', () => {
    expect(isPreviewableImageUrl('https://')).toBe(false);
  });
});

describe('imageUrlToStore', () => {
  test('an empty URL is stored as null', () => {
    expect(imageUrlToStore('  ')).toBeNull();
  });

  test('a URL is stored trimmed', () => {
    expect(imageUrlToStore('  https://example.com/squat.jpg ')).toBe('https://example.com/squat.jpg');
  });
});

describe('imageUrlError', () => {
  test('an empty URL has no error', () => {
    expect(imageUrlError('   ')).toBeNull();
  });

  test('an https URL has no error', () => {
    expect(imageUrlError('HTTPS://example.com/pilates.jpg')).toBeNull();
  });

  test('an http URL must start with https', () => {
    expect(imageUrlError('http://example.com/pilates.jpg')).toBe('Image URL must start with https://');
  });

  test('only the https prefix is rejected', () => {
    expect(imageUrlError('https://')).toBe('Image URL must start with https://');
  });
});
