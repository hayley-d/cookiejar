import { describe, expect, test } from 'bun:test';

import { exerciseVideoHref, exerciseVideoOf, videoPlayHandler, type ExerciseVideo } from '@/exercises/exerciseVideo';

describe('exerciseVideoOf', () => {
  test('an exercise with a video can be played', () => {
    expect(exerciseVideoOf({ name: 'Chin Ups', videoUrl: 'https://video.com/chin.mp4' })).toEqual({
      name: 'Chin Ups',
      videoUrl: 'https://video.com/chin.mp4',
    });
  });

  test('an exercise without a video cannot be played', () => {
    expect(exerciseVideoOf({ name: 'Squat', videoUrl: null })).toBeNull();
  });
});

describe('exerciseVideoHref', () => {
  test('opens the video sheet with the name and url', () => {
    expect(exerciseVideoHref({ name: 'Chin Ups', videoUrl: 'https://video.com/chin.mp4' })).toEqual({
      pathname: '/exercises/video',
      params: { name: 'Chin Ups', videoUrl: 'https://video.com/chin.mp4' },
    });
  });
});

describe('videoPlayHandler', () => {
  test('plays the video of an exercise that has one', () => {
    const playedVideos: ExerciseVideo[] = [];
    const handler = videoPlayHandler({ name: 'Dips', videoUrl: 'https://video.com/dips.mp4' }, (video) =>
      playedVideos.push(video),
    );
    handler?.();
    expect(playedVideos).toEqual([{ name: 'Dips', videoUrl: 'https://video.com/dips.mp4' }]);
  });

  test('gives no handler for an exercise without a video', () => {
    expect(videoPlayHandler({ name: 'Squat', videoUrl: null }, () => undefined)).toBeUndefined();
  });

  test('gives no handler when nothing can play videos', () => {
    expect(videoPlayHandler({ name: 'Dips', videoUrl: 'https://video.com/dips.mp4' }, undefined)).toBeUndefined();
  });
});
