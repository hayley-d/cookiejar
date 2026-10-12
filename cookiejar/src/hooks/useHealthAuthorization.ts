import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  getSetting,
  setSetting,
} from "@/database/repositories/appSettingsRepository";
import {
  healthReadTypesVersion,
  requestHealthAuthorization,
} from "@/health/healthAuthorization";
import type { HealthAuthorizationOutcome } from "@/health/HealthTypes";
import {
  healthAuthorizationReadTypesVersionSettingKey,
  healthAuthorizationRequestedAtSettingKey,
} from "@/health/healthSettingKeys";
import { needsHealthReadTypesRequest } from "@/health/needsHealthReadTypesRequest";

export function useHealthAuthorization() {
  const database = useSQLiteContext();
  const [requestedAt, setRequestedAt] = useState<string | null | undefined>(
    undefined,
  );
  const [storedReadTypesVersion, setStoredReadTypesVersion] = useState<
    string | null
  >(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([
        getSetting(database, healthAuthorizationRequestedAtSettingKey),
        getSetting(database, healthAuthorizationReadTypesVersionSettingKey),
      ]).then(
        ([storedRequestedAt, storedVersion]) => {
          if (isActive) {
            setRequestedAt(storedRequestedAt);
            setStoredReadTypesVersion(storedVersion);
          }
        },
        () => {},
      );
      return () => {
        isActive = false;
      };
    }, [database]),
  );

  const requestAuthorization =
    useCallback(async (): Promise<HealthAuthorizationOutcome> => {
      setIsRequesting(true);
      const outcome = await requestHealthAuthorization();
      if (outcome !== "unavailable") {
        const newRequestedAt = new Date().toISOString();
        await setSetting(
          database,
          healthAuthorizationRequestedAtSettingKey,
          newRequestedAt,
        ).catch(() => {});
        await setSetting(
          database,
          healthAuthorizationReadTypesVersionSettingKey,
          String(healthReadTypesVersion),
        ).catch(() => {});
        setRequestedAt(newRequestedAt);
        setStoredReadTypesVersion(String(healthReadTypesVersion));
      }
      setIsRequesting(false);
      return outcome;
    }, [database]);

  return {
    hasRequestedAuthorization:
      requestedAt === undefined ? null : requestedAt !== null,
    needsReadTypesRequest:
      requestedAt === undefined
        ? false
        : needsHealthReadTypesRequest(
            requestedAt,
            storedReadTypesVersion,
            healthReadTypesVersion,
          ),
    isRequesting,
    requestAuthorization,
  };
}
