import { describe, expect, test } from 'bun:test';

import { createQueuedRunner } from '@/notifications/createQueuedRunner';

function createDeferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('createQueuedRunner', () => {
  test('runs the task once when nothing else is running', async () => {
    let runCount = 0;
    const requestRun = createQueuedRunner(async () => {
      runCount += 1;
    });
    await requestRun();
    expect(runCount).toBe(1);
  });

  test('queues a single extra run for any requests made during a run', async () => {
    const pendingRuns = [createDeferred(), createDeferred()];
    let runCount = 0;
    let concurrentRuns = 0;
    let highestConcurrentRuns = 0;
    const requestRun = createQueuedRunner(async () => {
      const deferred = pendingRuns[runCount];
      runCount += 1;
      concurrentRuns += 1;
      highestConcurrentRuns = Math.max(highestConcurrentRuns, concurrentRuns);
      await deferred.promise;
      concurrentRuns -= 1;
    });

    const firstRequest = requestRun();
    await requestRun();
    await requestRun();
    expect(runCount).toBe(1);

    pendingRuns[0].resolve();
    await Promise.resolve();
    await Promise.resolve();
    pendingRuns[1].resolve();
    await firstRequest;

    expect(runCount).toBe(2);
    expect(highestConcurrentRuns).toBe(1);
  });

  test('keeps running after a task fails', async () => {
    let runCount = 0;
    const requestRun = createQueuedRunner(async () => {
      runCount += 1;
      throw new Error('failed');
    });
    await requestRun();
    await requestRun();
    expect(runCount).toBe(2);
  });
});
