import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';

type NuggieLoadingScreenProperties = {
  nuggie: NuggieName;
  caption: string;
  minimumDurationMilliseconds?: number;
  isReady: boolean;
  onFinished: () => void;
};

const nuggieSize = 180;

export function NuggieLoadingScreen({
  nuggie,
  caption,
  minimumDurationMilliseconds = 800,
  isReady,
  onFinished,
}: NuggieLoadingScreenProperties) {
  const [mountedAtMilliseconds] = useState(() => Date.now());
  const onFinishedReference = useRef(onFinished);
  const hasHiddenSplashScreen = useRef(false);
  const hasFinished = useRef(false);

  useEffect(() => {
    onFinishedReference.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (!isReady) {
      return undefined;
    }
    const elapsedMilliseconds = Date.now() - mountedAtMilliseconds;
    const remainingMilliseconds = Math.max(0, minimumDurationMilliseconds - elapsedMilliseconds);
    const timeout = setTimeout(() => {
      if (hasFinished.current) {
        return;
      }
      hasFinished.current = true;
      onFinishedReference.current();
    }, remainingMilliseconds);
    return () => clearTimeout(timeout);
  }, [isReady, minimumDurationMilliseconds, mountedAtMilliseconds]);

  function hideSplashScreenOnce() {
    if (hasHiddenSplashScreen.current) {
      return;
    }
    hasHiddenSplashScreen.current = true;
    SplashScreen.hide();
  }

  return (
    <Box
      background="background"
      align="center"
      justify="center"
      gap="large"
      style={StyleSheet.absoluteFill}
      onLayout={hideSplashScreenOnce}
    >
      <NuggieImage name={nuggie} size={nuggieSize} shape="circle" />
      <Typography variant="body" color="textSecondary" align="center">
        {caption}
      </Typography>
    </Box>
  );
}
