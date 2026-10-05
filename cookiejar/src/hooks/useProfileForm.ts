import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { updateProfile } from '@/database/repositories/profileRepository';
import { toLocalDateString } from '@/dates/toLocalDateString';
import {
  toProfileUpdate,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormValues,
} from '@/profile/validateProfileForm';
import { bumpDataVersion } from '@/stores/dataVersionStore';

type ProfileFormOptions = {
  initialValues: ProfileFormValues;
  onSaved: () => void;
};

export function useProfileForm({ initialValues, onSaved }: ProfileFormOptions) {
  const database = useSQLiteContext();
  const [values, setValues] = useState(initialValues);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validationErrors = validateProfileForm(values, toLocalDateString(new Date()));
  const errors: ProfileFormErrors = hasAttemptedSave ? validationErrors : {};

  async function save() {
    setHasAttemptedSave(true);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile(database, toProfileUpdate(values));
      bumpDataVersion();
      onSaved();
    } finally {
      setIsSaving(false);
    }
  }

  return { values, errors, isSaving, changeValues: setValues, save };
}
