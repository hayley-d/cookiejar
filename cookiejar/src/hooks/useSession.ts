import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  addSessionExercises,
  addSessionSet,
  completeSessionSet,
  discardSession,
  finishSession,
  getPreviousSessionSets,
  getSessionWithExercises,
  removeSessionExercise,
  removeSessionSet,
  replaceSessionExercise,
  uncompleteSessionSet,
  updateSessionExerciseRest,
  updateSessionNotes,
  updateSessionSet,
} from '@/database/repositories/sessionRepository';
import type { PreviousSessionSet } from '@/sessions/describePreviousSet';
import { actualValuesOf, fillSetForTick, type SetCompletionOutcome, type SetValues } from '@/sessions/fillSetForTick';
import { mergeReloadedSession } from '@/sessions/mergeReloadedSession';
import { valuesForAddedSet } from '@/sessions/valuesForAddedSet';
import { resolveRestTimerStart } from '@/sessions/resolveRestTimerStart';
import { findSessionSet, withSessionSetChanges } from '@/sessions/sessionSetChanges';
import { bumpDataVersion } from '@/stores/dataVersionStore';
import { clearRestTimer, startRestTimer } from '@/stores/restTimerStore';
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

type PreviousSetsByExerciseId = Map<number, PreviousSessionSet[]>;

const noPreviousSets: PreviousSetsByExerciseId = new Map();

type WriteTask = () => Promise<void>;

const textInputDebounceMilliseconds = 400;

function alertWriteFailure() {
  Alert.alert('Could not save', 'Your last change was not saved. Please try again.');
}

export function useSession(sessionId: number) {
  const database = useSQLiteContext();
  const [loadedSession, setLoadedSession] = useState<LoadedSession | null>(null);
  const [previousSets, setPreviousSets] = useState<{
    sessionId: number;
    byExerciseId: PreviousSetsByExerciseId;
  } | null>(null);
  const sessionReference = useRef<SessionWithExercises | null>(null);
  const pendingValueWrites = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const pendingNotesWrite = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const exerciseIdsKey =
    loadedSession !== null && loadedSession.lookup.status === 'found'
      ? [...new Set(loadedSession.lookup.session.exercises.map((sessionExercise) => sessionExercise.exerciseId))].join(
          ',',
        )
      : '';

  useEffect(() => {
    if (!Number.isInteger(sessionId) || exerciseIdsKey.length === 0) {
      return;
    }
    let isActive = true;
    const exerciseIds = exerciseIdsKey.split(',').map(Number);
    Promise.all(
      exerciseIds.map(async (exerciseId): Promise<[number, PreviousSessionSet[]]> => [
        exerciseId,
        await getPreviousSessionSets(database, exerciseId, sessionId),
      ]),
    ).then(
      (entries) => {
        if (isActive) {
          setPreviousSets({ sessionId, byExerciseId: new Map(entries) });
        }
      },
      () => {
        if (isActive) {
          setPreviousSets({ sessionId, byExerciseId: noPreviousSets });
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, sessionId, exerciseIdsKey]);

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

  const writeLatestNotes = useCallback(
    () =>
      enqueueWrite(async () => {
        const session = sessionReference.current;
        if (session !== null) {
          await updateSessionNotes(database, session.id, session.notes);
        }
      }),
    [database, enqueueWrite],
  );

  const cancelPendingNotesWrite = useCallback(() => {
    if (pendingNotesWrite.current !== null) {
      clearTimeout(pendingNotesWrite.current);
      pendingNotesWrite.current = null;
    }
  }, []);

  const flushPendingValueWrites = useCallback(async () => {
    const pendingSessionSetIds = [...pendingValueWrites.current.keys()];
    for (const sessionSetId of pendingSessionSetIds) {
      cancelPendingValueWrite(sessionSetId);
      writeLatestValues(sessionSetId);
    }
    if (pendingNotesWrite.current !== null) {
      cancelPendingNotesWrite();
      writeLatestNotes();
    }
    await writeQueue.current;
  }, [cancelPendingNotesWrite, cancelPendingValueWrite, writeLatestNotes, writeLatestValues]);

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

  const changeNotes = useCallback(
    (notes: string) => {
      applySessionChange((session) => ({ ...session, notes: notes.length === 0 ? null : notes }));
      cancelPendingNotesWrite();
      pendingNotesWrite.current = setTimeout(() => {
        pendingNotesWrite.current = null;
        writeLatestNotes();
      }, textInputDebounceMilliseconds);
    },
    [applySessionChange, cancelPendingNotesWrite, writeLatestNotes],
  );

  const enqueueStructuralChange = useCallback(
    (change: () => Promise<void>) =>
      enqueueWrite(async () => {
        await change();
        const reloadedSession = await getSessionWithExercises(database, sessionId);
        if (reloadedSession === null) {
          return;
        }
        const mergedSession = mergeReloadedSession(reloadedSession, sessionReference.current, {
          pendingValueSetIds: new Set(pendingValueWrites.current.keys()),
          hasPendingNotes: pendingNotesWrite.current !== null,
        });
        sessionReference.current = mergedSession;
        setLoadedSession({ sessionId: mergedSession.id, lookup: { status: 'found', session: mergedSession } });
      }),
    [database, enqueueWrite, sessionId],
  );

  const addSet = useCallback(
    (sessionExerciseId: number) => {
      const exercise = sessionReference.current?.exercises.find((candidate) => candidate.id === sessionExerciseId);
      if (exercise === undefined) {
        return;
      }
      const lastSet = exercise.sets[exercise.sets.length - 1] ?? null;
      const values = valuesForAddedSet(lastSet);
      enqueueStructuralChange(() => addSessionSet(database, sessionExerciseId, values));
    },
    [database, enqueueStructuralChange],
  );

  const removeSet = useCallback(
    (sessionExerciseId: number, sessionSetId: number) => {
      cancelPendingValueWrite(sessionSetId);
      enqueueStructuralChange(() => removeSessionSet(database, sessionExerciseId, sessionSetId));
    },
    [cancelPendingValueWrite, database, enqueueStructuralChange],
  );

  const addExercises = useCallback(
    (exerciseIds: number[]) => {
      enqueueStructuralChange(() => addSessionExercises(database, sessionId, exerciseIds));
    },
    [database, enqueueStructuralChange, sessionId],
  );

  const replaceExercise = useCallback(
    (sessionExerciseId: number, newExerciseId: number) => {
      enqueueStructuralChange(() => replaceSessionExercise(database, sessionId, sessionExerciseId, newExerciseId));
    },
    [database, enqueueStructuralChange, sessionId],
  );

  const removeExercise = useCallback(
    (sessionExerciseId: number) => {
      const exercise = sessionReference.current?.exercises.find((candidate) => candidate.id === sessionExerciseId);
      for (const set of exercise?.sets ?? []) {
        cancelPendingValueWrite(set.id);
      }
      enqueueStructuralChange(() => removeSessionExercise(database, sessionId, sessionExerciseId));
    },
    [cancelPendingValueWrite, database, enqueueStructuralChange, sessionId],
  );

  const changeExerciseRest = useCallback(
    (sessionExerciseId: number, restSeconds: number | null) => {
      applySessionChange((session) => ({
        ...session,
        exercises: session.exercises.map((exercise) =>
          exercise.id === sessionExerciseId ? { ...exercise, restSeconds } : exercise,
        ),
      }));
      enqueueWrite(() => updateSessionExerciseRest(database, sessionId, sessionExerciseId, restSeconds));
    },
    [applySessionChange, database, enqueueWrite, sessionId],
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
      const tickedSession = sessionReference.current;
      if (tickedSession !== null) {
        const restTimerStart = resolveRestTimerStart(tickedSession.exercises, sessionSetId);
        if (restTimerStart.shouldStart) {
          startRestTimer(restTimerStart.restSeconds);
        }
      }
      return 'ticked';
    },
    [applySessionChange, cancelPendingValueWrite, database, enqueueWrite],
  );

  const finish = useCallback(async () => {
    await flushPendingValueWrites();
    await finishSession(database, sessionId);
    clearRestTimer();
    bumpDataVersion();
  }, [database, flushPendingValueWrites, sessionId]);

  const discard = useCallback(async () => {
    for (const sessionSetId of [...pendingValueWrites.current.keys()]) {
      cancelPendingValueWrite(sessionSetId);
    }
    cancelPendingNotesWrite();
    await writeQueue.current;
    await discardSession(database, sessionId);
    clearRestTimer();
    bumpDataVersion();
  }, [cancelPendingNotesWrite, cancelPendingValueWrite, database, sessionId]);

  let sessionLookup: SessionLookup;
  if (!Number.isInteger(sessionId)) {
    sessionLookup = { status: 'missing' };
  } else if (loadedSession === null || loadedSession.sessionId !== sessionId) {
    sessionLookup = { status: 'loading' };
  } else {
    sessionLookup = loadedSession.lookup;
  }

  const previousSetsByExerciseId =
    previousSets !== null && previousSets.sessionId === sessionId ? previousSets.byExerciseId : noPreviousSets;

  return {
    sessionLookup,
    previousSetsByExerciseId,
    changeSetValues,
    toggleSetCompletion,
    addSet,
    removeSet,
    addExercises,
    replaceExercise,
    removeExercise,
    changeExerciseRest,
    changeNotes,
    finish,
    discard,
  };
}
