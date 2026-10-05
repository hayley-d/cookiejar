import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { createPlan as insertPlan, listPlans } from '@/database/repositories/planRepository';
import { bumpDataVersion } from '@/stores/dataVersionStore';
import type { PlanSummary } from '@/types/PlanSummary';

export function usePlans() {
  const database = useSQLiteContext();
  const [plans, setPlans] = useState<PlanSummary[] | null>(null);

  const reloadPlans = useCallback(async () => {
    setPlans(await listPlans(database));
  }, [database]);

  const createPlan = useCallback(
    async (name: string) => {
      const planId = await insertPlan(database, name);
      bumpDataVersion();
      return planId;
    },
    [database],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      listPlans(database).then(
        (loadedPlans) => {
          if (isActive) {
            setPlans(loadedPlans);
          }
        },
        () => {},
      );
      return () => {
        isActive = false;
      };
    }, [database]),
  );

  return { plans, reloadPlans, createPlan };
}
