import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { TextButton } from '@/components/atoms/TextButton';
import { FormField } from '@/components/molecules/FormField';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { usePlans } from '@/hooks/usePlans';
import { planNameError } from '@/plans/planNameError';

export default function NewPlanScreen() {
  const { createPlan } = usePlans();
  const [name, setName] = useState('');
  const [hasAttemptedCreate, setHasAttemptedCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const isCreateInFlight = useRef(false);
  const nameError = planNameError(name);

  const create = async () => {
    setHasAttemptedCreate(true);
    if (nameError !== null || isCreateInFlight.current) {
      return;
    }
    isCreateInFlight.current = true;
    setIsCreating(true);
    try {
      const planId = await createPlan(name.trim());
      router.replace({ pathname: '/plans/[planId]', params: { planId: String(planId) } });
    } catch {
      Alert.alert('Could not create the plan', 'Something went wrong. Please try again.');
    } finally {
      isCreateInFlight.current = false;
      setIsCreating(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <TextButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => <TextButton label="Create" onPress={create} disabled={isCreating} />,
        }}
      />
      <ScrollBox gap="large">
        <FormField label="Name" error={hasAttemptedCreate ? (nameError ?? undefined) : undefined}>
          <TextField
            value={name}
            onChangeText={setName}
            placeholder="e.g. Summer Strength"
            autoCapitalize="words"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={create}
            accessibilityLabel="Name"
          />
        </FormField>
      </ScrollBox>
    </>
  );
}
