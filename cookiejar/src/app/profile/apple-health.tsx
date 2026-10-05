import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { describeHealthAccessStatus } from '@/health/describeHealthAccessStatus';
import { useHealthAuthorization } from '@/hooks/useHealthAuthorization';

const garminSteps = [
  'Open Garmin Connect on your phone.',
  'Open settings, then Connected Apps, then Apple Health.',
  'Turn on the data types: steps, sleep, resting heart rate and workouts.',
];

export default function AppleHealthScreen() {
  const { hasRequestedAuthorization, isRequesting, requestAuthorization } = useHealthAuthorization();
  const description = describeHealthAccessStatus(hasRequestedAuthorization);

  return (
    <Box flex={1} background="background">
      <ScrollBox>
        <Card>
          <Box gap="small">
            <Typography variant="label">{description.headline}</Typography>
            {description.detail ? (
              <Typography variant="body" color="textSecondary">
                {description.detail}
              </Typography>
            ) : null}
            {hasRequestedAuthorization === false ? (
              <Button
                label="Request access"
                onPress={() => {
                  void requestAuthorization();
                }}
                disabled={isRequesting}
              />
            ) : null}
          </Box>
        </Card>
        <Card>
          <Box gap="small">
            <Typography variant="label">Get Garmin data into Cookiejar</Typography>
            <Typography variant="body" color="textSecondary">
              Garmin Connect shares your data through Apple Health, and Cookiejar reads it from there.
            </Typography>
            {garminSteps.map((step, stepIndex) => (
              <Typography key={step} variant="body" color="textSecondary">
                {`${stepIndex + 1}. ${step}`}
              </Typography>
            ))}
          </Box>
        </Card>
      </ScrollBox>
    </Box>
  );
}
