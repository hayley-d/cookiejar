import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { addBodyMeasurement } from '@/database/repositories/bodyMeasurementRepository';
import { toLocalDateString } from '@/dates/toLocalDateString';
import {
  toBodyMeasurementInput,
  validateMeasurementForm,
  type MeasurementFormErrors,
  type MeasurementFormValues,
} from '@/measurements/validateMeasurementForm';
import { bumpDataVersion } from '@/stores/dataVersionStore';

type MeasurementFormOptions = {
  onSaved: () => void;
};

function createInitialValues(): MeasurementFormValues {
  return {
    measuredOn: toLocalDateString(new Date()),
    weightKilograms: null,
    bodyFatPercent: null,
    waistCentimetres: null,
    hipCentimetres: null,
    chestCentimetres: null,
    notes: '',
  };
}

export function useMeasurementForm({ onSaved }: MeasurementFormOptions) {
  const database = useSQLiteContext();
  const [values, setValues] = useState(createInitialValues);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSaveInFlight = useRef(false);

  const validationErrors = validateMeasurementForm(values, toLocalDateString(new Date()));
  const errors: MeasurementFormErrors = hasAttemptedSave ? validationErrors : {};

  async function save() {
    setHasAttemptedSave(true);
    if (Object.keys(validationErrors).length > 0 || isSaveInFlight.current) {
      return;
    }
    isSaveInFlight.current = true;
    setIsSaving(true);
    try {
      await addBodyMeasurement(database, toBodyMeasurementInput(values));
      bumpDataVersion();
      onSaved();
    } catch {
      Alert.alert('Could not save the measurement', 'Something went wrong. Please try again.');
    } finally {
      isSaveInFlight.current = false;
      setIsSaving(false);
    }
  }

  return { values, errors, isSaving, changeValues: setValues, save };
}
