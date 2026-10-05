import { FormField } from '@/components/molecules/FormField';
import { TextField } from '@/components/primitives/TextField';

export type WorkoutNameFieldProperties = {
  name: string;
  error: string | null;
  onChangeName: (name: string) => void;
};

export function WorkoutNameField({ name, error, onChangeName }: WorkoutNameFieldProperties) {
  return (
    <FormField label="Name" error={error ?? undefined}>
      <TextField
        value={name}
        onChangeText={onChangeName}
        placeholder="e.g. Push Day"
        autoCapitalize="words"
        returnKeyType="done"
        accessibilityLabel="Name"
      />
    </FormField>
  );
}
