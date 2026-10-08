import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseVideoSheet } from '@/components/organisms/ExerciseVideoSheet';
import { isPreviewableImageUrl } from '@/images/imageUrls';

type ExerciseVideoParameters = {
  name: string;
  videoUrl: string;
};

export default function ExerciseVideoScreen() {
  const { name, videoUrl } = useLocalSearchParams<ExerciseVideoParameters>();

  if (typeof videoUrl !== 'string' || !isPreviewableImageUrl(videoUrl)) {
    return (
      <EmptyState
        title="Could not play the video"
        message="This exercise has no video."
        actionLabel="Close"
        onAction={() => router.back()}
      />
    );
  }

  return <ExerciseVideoSheet exerciseName={name ?? ''} videoUrl={videoUrl} onClose={() => router.back()} />;
}
