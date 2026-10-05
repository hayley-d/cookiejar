import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  completeSessionSet,
  discardSession,
  finishSession,
  getSessionWithExercises,
  uncompleteSessionSet,
  updateSessionSet,
} from '@/database/repositories/sessionRepository';
import {
  actualValuesOf,
  fillSetForTick,
  type SetCompletionOutcome,
  type SetValues,
} from '@/sessions/fillSetForTick';
import { findSessionSet, withSessionSetChanges } from '@/sessions/sessionSetChanges';
import { bumpDataVersion } from '@/stores/dataVersionStore';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

export type SessionLookup =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'failed' }
  | { status: 'found'; session: SessionWithExercises };

type LoadedSession = {
  sessionId: number;
  lookup: Exclude<SessionLookup, { status: 'loading' }>;
};

type WriteTask = () => Promise<void>;

const textInputDebounceMilliseconds = 400;

function alertWriteFailure() {
  Alert.alert('Could not save', 'Your last change was not saved. Please try again.');
}

export function useSession(sessionId: number) {
  const database = useSQLiteContext();
  const [loadedSession, setLoadedSession] = useState<LoadedSession | null>(null);
  const sessionReference = useRef<SessionWithExercises | null>(null);
  const pendingValueWrites = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isActive = true;
    if (!Number.isInteger(sessionId)) {
      return;
    }
    getSessionWithExercises(database, sessionId).then(
      (session) => {
        if (!isActive) {
          return;
        }
        sessionReference.current = session;
        setLoadedSession({ sessionId, lookup: session ? { status: 'found', session } : { status: 'missing' } });
      },
      () => {
        if (isActive) {
          setLoadedSession({ sessionId, lookup: { status: 'failed' } });
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, sessionId]);

  const enqueueWrite = useCallback((task: WriteTask) => {
    writeQueue.current = writeQueue.current.then(task).then(bumpDataVersion, alertWriteFailure);
    return writeQueue.current;
  }, []);

  const writeLatestValues = useCallback(
    (sessionSetId: number) =>
      enqueueWrite(async () => {
        const session = sessionReference.current;
        const found = session === null ? null : findSessionSet(session, sessionSetId);
        if (found !== null) {
          await updateSessionSet(database, sessionSetId, actualValuesOf(found.set));
        }
      }),
    [database, enqueueWrite],
  );

  const cancelPendingValueWrite = useCallback((sessionSetId: number) => {
    const pendingWrite = pendingValueWrites.current.get(sessionSetId);
    if (pendingWrite !== undefined) {
      clearTimeout(pendingWrite);
      pendingValueWrites.current.delete(sessionSetId);
    }
  }, []);

  const flushPendingValueWrites = useCallback(async () => {
    const pendingSessionSetIds = [...pendingValueWrites.current.keys()];
    for (const sessionSetId of pendingSessionSetIds) {
      cancelPendingValueWrite(sessionSetId);
      writeLatestValues(sessionSetId);
    }
    await writeQueue.current;
  }, [cancelPendingValueWrite, writeLatestValues]);

  useEffect(() => {
    return () => {
      void flushPendingValueWrites();
    };
  }, [flushPendingValueWrites]);

  const applySessionChange = useCallback((change: (session: SessionWithExercises) => SessionWithExercises) => {
    const session = sessionReference.current;
    if (session === null) {
      return;
    }
    const changedSession = change(session);
    sessionReference.current = changedSession;
    setLoadedSession({ sessionId: changedSession.id, lookup: { status: 'found', session: changedSession } });
  }, []);

  const changeSetValues = useCallback(
    (sessionSetId: number, changes: Partial<SetValues>) => {
      applySessionChange((session) => withSessionSetChanges(session, sessionSetId, changes));
      cancelPendingValueWrite(sessionSetId);
      pendingValueWrites.current.set(
        sessionSetId,
        setTimeout(() => {
          pendingValueWrites.current.delete(sessionSetId);
          writeLatestValues(sessionSetId);
        }, textInputDebounceMilliseconds),
      );
    },
    [applySessionChange, cancelPendingValueWrite, writeLatestValues],
  );

  const toggleSetCompletion = useCallback(
    (sessionSetId: number): SetCompletionOutcome => {
      const session = sessionReference.current;
      const found = session === null ? null : findSessionSet(session, sessionSetId);
      if (found === null) {
        return 'refused';
      }

      if (found.set.completedAt !== null) {
        applySessionChange((currentSession) =>
          withSessionSetChanges(currentSession, sessionSetId, { completedAt: null }),
        );
        enqueueWrite(() => uncompleteSessionSet(database, sessionSetId));
        return 'unticked';
      }

      const tickResult = fillSetForTick(found.exercise.trackingType, found.set);
      if (tickResult.outcome === 'refused') {
        return 'refused';
      }

      const completedAt = new Date().toISOString();
      cancelPendingValueWrite(sessionSetId);
      applySessionChange((currentSession) =>
        withSessionSetChanges(currentSession, sessionSetId, { ...tickResult.values, completedAt }),
      );
      enqueueWrite(async () => {
        await updateSessionSet(database, sessionSetId, tickResult.values);
        await completeSessionSet(database, sessionSetId, completedAt);
      });
      return 'ticked';
    },
    [applySessionChange, cancelPendingValueWrite, database, enqueueWrite],
  );

  const finish = useCallback(async () => {
    await flushPendingValueWrites();
    await finishSession(database, sessionId);
    bumpDataVersion();
  }, [database, flushPendingValueWrites, sessionId]);

  const discard = useCallback(async () => {
    for (const sessionSetId of [...pendingValueWrites.current.keys()]) {
      cancelPendingValueWrite(sessionSetId);
    }
    await writeQueue.current;
    await discardSession(database, sessionId);
    bumpDataVersion();
  }, [cancelPendingValueWrite, database, sessionId]);

  let sessionLookup: SessionLookup;
  if (!Number.isInteger(sessionId)) {
    sessionLookup = { status: 'missing' };
  } else if (loadedSession === null || loadedSession.sessionId !== sessionId) {
    sessionLookup = { status: 'loading' };
  } else {
    sessionLookup = loadedSession.lookup;
  }

  return { sessionLookup, changeSetValues, toggleSetCompletion, finish, discard };
}
