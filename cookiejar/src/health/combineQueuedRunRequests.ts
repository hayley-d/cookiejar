export type RunRequest = {
  isActive: () => boolean;
  execute: (isActive: () => boolean) => Promise<void>;
};

export function combineQueuedRunRequests(queuedRequest: RunRequest | null, incomingRequest: RunRequest): RunRequest {
  if (queuedRequest === null) {
    return incomingRequest;
  }
  return {
    isActive: () => queuedRequest.isActive() || incomingRequest.isActive(),
    execute: incomingRequest.execute,
  };
}
