import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import {
  addPlanEntry as insertPlanEntry,
  copyDayEntries,
  getPlanWithEntries,
  removePlanEntry as deletePlanEntry,
  type NewPlanEntry,
  updatePlanEntryTime as writePlanEntryTime,
} from '@/database/repositories/planRepository';
import { bumpDataVersion } from '@/stores/dataVersionStore';
import type { PlanWithEntries } from '@/types/PlanWithEntries';

export type PlanLookup =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'failed' }
  | { status: 'found'; plan: PlanWithEntries };

function toPlanLookup(plan: PlanWithEntries | null): PlanLookup {
  return plan === null ? { status: 'missing' } : { status: 'found', plan };
}

export function usePlan(planId: number) {
  const database = useSQLiteContext();
  const [planLookup, setPlanLookup] = useState<PlanLookup>({ status: 'loading' });

  const reloadPlan = useCallback(async () => {
    setPlanLookup(toPlanLookup(await getPlanWithEntries(database, planId)));
  }, [database, planId]);

  const addPlanEntry = useCallback(
    async (newPlanEntry: Omit<NewPlanEntry, 'planId'>) => {
      const planEntryId = await insertPlanEntry(database, { ...newPlanEntry, planId });
      bumpDataVersion();
      return planEntryId;
    },
    [database, planId],
  );

  const updatePlanEntryTime = useCallback(
    async (planEntryId: number, timeOfDay: string) => {
      await writePlanEntryTime(database, planEntryId, timeOfDay);
      bumpDataVersion();
      await reloadPlan();
    },
    [database, reloadPlan],
  );

  const removePlanEntry = useCallback(
    async (planEntryId: number) => {
      await deletePlanEntry(database, planEntryId);
      bumpDataVersion();
      await reloadPlan();
    },
    [database, reloadPlan],
  );

  const copyDay = useCallback(
    async (fromDayOfWeek: number, toDaysOfWeek: readonly number[]) => {
      const copiedEntryCount = await copyDayEntries(database, planId, fromDayOfWeek, toDaysOfWeek);
      bumpDataVersion();
      return copiedEntryCount;
    },
    [database, planId],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (!Number.isInteger(planId)) {
        setPlanLookup({ status: 'missing' });
        return;
      }
      getPlanWithEntries(database, planId).then(
        (plan) => {
          if (isActive) {
            setPlanLookup(toPlanLookup(plan));
          }
        },
        () => {
          if (isActive) {
            setPlanLookup({ status: 'failed' });
          }
        },
      );
      return () => {
        isActive = false;
      };
    }, [database, planId]),
  );

  return { planLookup, reloadPlan, addPlanEntry, updatePlanEntryTime, removePlanEntry, copyDay };
}
