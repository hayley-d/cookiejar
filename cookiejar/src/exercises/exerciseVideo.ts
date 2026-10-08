export type ExerciseVideo = {
  name: string;
  videoUrl: string;
};

export function exerciseVideoOf(exercise: { name: string; videoUrl: string | null }): ExerciseVideo | null {
  return exercise.videoUrl === null ? null : { name: exercise.name, videoUrl: exercise.videoUrl };
}

export function exerciseVideoHref(video: ExerciseVideo) {
  return { pathname: '/exercises/video', params: { name: video.name, videoUrl: video.videoUrl } } as const;
}

export function videoPlayHandler(
  exercise: { name: string; videoUrl: string | null },
  onPlayVideo: ((video: ExerciseVideo) => void) | undefined,
): (() => void) | undefined {
  const video = exerciseVideoOf(exercise);
  if (video === null || onPlayVideo === undefined) {
    return undefined;
  }
  return () => onPlayVideo(video);
}
