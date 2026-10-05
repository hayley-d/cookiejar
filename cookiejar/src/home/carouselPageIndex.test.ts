import { describe, expect, test } from 'bun:test';

import { carouselPageIndex } from '@/home/carouselPageIndex';

describe('carouselPageIndex', () => {
  test('rounds to the nearest page', () => {
    expect(carouselPageIndex({ offsetX: 0, snapInterval: 300, pageCount: 3 })).toBe(0);
    expect(carouselPageIndex({ offsetX: 149, snapInterval: 300, pageCount: 3 })).toBe(0);
    expect(carouselPageIndex({ offsetX: 151, snapInterval: 300, pageCount: 3 })).toBe(1);
    expect(carouselPageIndex({ offsetX: 600, snapInterval: 300, pageCount: 3 })).toBe(2);
  });

  test('clamps overscroll and empty lists', () => {
    expect(carouselPageIndex({ offsetX: -40, snapInterval: 300, pageCount: 3 })).toBe(0);
    expect(carouselPageIndex({ offsetX: 900, snapInterval: 300, pageCount: 3 })).toBe(2);
    expect(carouselPageIndex({ offsetX: 300, snapInterval: 300, pageCount: 0 })).toBe(0);
    expect(carouselPageIndex({ offsetX: 300, snapInterval: 0, pageCount: 3 })).toBe(0);
  });
});
