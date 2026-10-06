import { expect, test } from "bun:test";

import { formatRelativeTime } from "@/dates/formatRelativeTime";

const now = new Date(2026, 9, 6, 15, 0, 0);

test("says just now within the first minute", () => {
  expect(
    formatRelativeTime(new Date(2026, 9, 6, 14, 59, 30).toISOString(), now),
  ).toBe("Just now");
});

test("counts minutes within the hour", () => {
  expect(
    formatRelativeTime(new Date(2026, 9, 6, 14, 45, 0).toISOString(), now),
  ).toBe("15m ago");
});

test("counts whole hours earlier the same day", () => {
  expect(
    formatRelativeTime(new Date(2026, 9, 6, 13, 0, 0).toISOString(), now),
  ).toBe("2h ago");
  expect(
    formatRelativeTime(new Date(2026, 9, 6, 0, 30, 0).toISOString(), now),
  ).toBe("14h ago");
});

test("says yesterday for the previous calendar day, even under 24 hours ago", () => {
  expect(
    formatRelativeTime(new Date(2026, 9, 5, 23, 0, 0).toISOString(), now),
  ).toBe("Yesterday");
  expect(
    formatRelativeTime(new Date(2026, 9, 5, 8, 0, 0).toISOString(), now),
  ).toBe("Yesterday");
});

test("uses day and month for older dates", () => {
  expect(
    formatRelativeTime(new Date(2026, 9, 3, 19, 0, 0).toISOString(), now),
  ).toBe("3 Oct");
  expect(
    formatRelativeTime(new Date(2026, 8, 20, 19, 0, 0).toISOString(), now),
  ).toBe("20 Sep");
});

test("says just now for a timestamp slightly in the future", () => {
  expect(
    formatRelativeTime(new Date(2026, 9, 6, 15, 0, 5).toISOString(), now),
  ).toBe("Just now");
});
