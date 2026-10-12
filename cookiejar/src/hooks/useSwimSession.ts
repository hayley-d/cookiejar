import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';

import { discardSession } from '@/database/repositories/sessionRepository';
import {
  completeOpenSwimRepetitions,
  finishSwimSession,
  setSwimRepetitionCompletion,
} from '@/database/repositories/swimSessionRepository';
import { swimFinishedAt } from '@/swimming/swimDuration';
import {
  findRepetitionCompletion,
  withAllRepetitionsCompleted,
  withRepetitionCompletion,
} from '@/swimming/swimSessionChanges';
import type { SwimSessionSection } from '@/swimming/swimSessionTypes';
import { bumpDataVersion } from '@/stores/dataVersionStore';

type WriteTask = () => Promise<void>;

const tickWriteDebounceMilliseconds = 400;

function alertWriteFailure() {
  Alert.alert('Could not save', 'Your last change was not saved. Please try again.');
}

export function useSwimSession(sessionId: number, startedAt: string, initialSections: SwimSessionSection[]) {
  const database = useSQLiteContext();
  const [sections, setSections] = useState(initialSections);
  const sectionsReference = useRef(initialSections);
  const pendingTickWrites = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const enqueueWrite = useCallback((task: WriteTask) => {
    writeQueue.current = writeQueue.current.then(task).then(bumpDataVersion, alertWriteFailure);
    return writeQueue.current;
  }, []);

  const applySectionsChange = useCallback((change: (current: SwimSessionSection[]) => SwimSessionSection[]) => {
    const changedSections = change(sectionsReference.current);
    sectionsReference.current = changedSections;
    setSections(changedSections);
  }, []);

  const writeLatestTick = useCallback(
    (repetitionId: number) =>
      enqueueWrite(async () => {
        const completedAt = findRepetitionCompletion(sectionsReference.current, repetitionId);
        if (completedAt !== undefined) {
          await setSwimRepetitionCompletion(database, repetitionId, completedAt);
        }
      }),
    [database, enqueueWrite],
  );

  const cancelPendingTickWrites = useCallback(() => {
    for (const pendingWrite of pendingTickWrites.current.values()) {
      clearTimeout(pendingWrite);
    }
    pendingTickWrites.current.clear();
  }, []);

  const enqueuePendingTickWrites = useCallback(() => {
    const pendingRepetitionIds = [...pendingTickWrites.current.keys()];
    cancelPendingTickWrites();
    for (const repetitionId of pendingRepetitionIds) {
      writeLatestTick(repetitionId);
    }
  }, [cancelPendingTickWrites, writeLatestTick]);

  const flushPendingTickWrites = useCallback(async () => {
    enqueuePendingTickWrites();
    await writeQueue.current;
  }, [enqueuePendingTickWrites]);

  useEffect(() => {
    return () => {
      void flushPendingTickWrites();
    };
  }, [flushPendingTickWrites]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState === 'background' || appState === 'inactive') {
        enqueuePendingTickWrites();
      }
    });
    return () => subscription.remove();
  }, [enqueuePendingTickWrites]);

  const toggleRepetition = useCallback(
    (repetitionId: number) => {
      const currentCompletion = findRepetitionCompletion(sectionsReference.current, repetitionId);
      if (currentCompletion === undefined) {
        return;
      }
      const completedAt = currentCompletion === null ? new Date().toISOString() : null;
      applySectionsChange((current) => withRepetitionCompletion(current, repetitionId, completedAt));
      const pendingWrite = pendingTickWrites.current.get(repetitionId);
      if (pendingWrite !== undefined) {
        clearTimeout(pendingWrite);
      }
      pendingTickWrites.current.set(
        repetitionId,
        setTimeout(() => {
          pendingTickWrites.current.delete(repetitionId);
          writeLatestTick(repetitionId);
        }, tickWriteDebounceMilliseconds),
      );
    },
    [applySectionsChange, writeLatestTick],
  );

  const markAllDone = useCallback(() => {
    const completedAt = new Date().toISOString();
    cancelPendingTickWrites();
    applySectionsChange((current) => withAllRepetitionsCompleted(current, completedAt));
    enqueueWrite(() => completeOpenSwimRepetitions(database, sessionId, completedAt));
  }, [applySectionsChange, cancelPendingTickWrites, database, enqueueWrite, sessionId]);

  const finish = useCallback(
    async (durationSeconds: number) => {
      await flushPendingTickWrites();
      await finishSwimSession(database, sessionId, swimFinishedAt(startedAt, durationSeconds));
      bumpDataVersion();
    },
    [database, flushPendingTickWrites, sessionId, startedAt],
  );

  const discard = useCallback(async () => {
    cancelPendingTickWrites();
    await writeQueue.current;
    await discardSession(database, sessionId);
    bumpDataVersion();
  }, [cancelPendingTickWrites, database, sessionId]);

  return { sections, toggleRepetition, markAllDone, finish, discard };
}
