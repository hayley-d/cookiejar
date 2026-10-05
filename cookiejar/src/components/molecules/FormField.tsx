import type { ReactNode } from 'react';

import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';

type FormFieldProperties = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, error, children }: FormFieldProperties) {
  return (
    <Stack gap="small">
      <Typography variant="label">{label}</Typography>
      {children}
      {error ? (
        <Typography variant="caption" color="danger">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}
