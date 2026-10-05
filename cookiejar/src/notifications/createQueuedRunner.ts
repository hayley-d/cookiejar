export function createQueuedRunner(task: () => Promise<void>): () => Promise<void> {
  let isRunning = false;
  let hasQueuedRun = false;

  return async function requestRun() {
    if (isRunning) {
      hasQueuedRun = true;
      return;
    }
    isRunning = true;
    try {
      do {
        hasQueuedRun = false;
        try {
          await task();
        } catch {}
      } while (hasQueuedRun);
    } finally {
      isRunning = false;
    }
  };
}
