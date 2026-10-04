import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { alphabetIndexLetters } from '@/exercises/groupExercisesAlphabetically';

type AlphabetIndexProperties = {
  availableLetters: string[];
  onSelectLetter: (letter: string) => void;
};

const letterHeight = 16;
const dimmedOpacity = 0.35;

function letterAtPosition(verticalPosition: number) {
  const letterPosition = Math.floor(verticalPosition / letterHeight);
  const clampedPosition = Math.min(Math.max(letterPosition, 0), alphabetIndexLetters.length - 1);
  return alphabetIndexLetters[clampedPosition];
}

export function AlphabetIndex({ availableLetters, onSelectLetter }: AlphabetIndexProperties) {
  const lastSelectedLetter = useRef<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const selectLetterAtTouch = (event: GestureResponderEvent) => {
    const letter = letterAtPosition(event.nativeEvent.locationY);
    if (letter === lastSelectedLetter.current) {
      return;
    }
    lastSelectedLetter.current = letter;
    setActiveLetter(letter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectLetter(letter);
  };

  const finishSelecting = () => {
    lastSelectedLetter.current = null;
    setActiveLetter(null);
  };

  return (
    <Box
      paddingHorizontal="extraSmall"
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={selectLetterAtTouch}
      onResponderMove={selectLetterAtTouch}
      onResponderRelease={finishSelecting}
      onResponderTerminate={finishSelecting}
    >
      <Box style={{ pointerEvents: 'none' }}>
        {alphabetIndexLetters.map((letter) => (
          <Typography
            key={letter}
            variant="caption"
            color={letter === activeLetter ? 'textPrimary' : 'accent'}
            align="center"
            style={{
              height: letterHeight,
              lineHeight: letterHeight,
              fontWeight: '700',
              opacity: availableLetters.includes(letter) ? 1 : dimmedOpacity,
            }}
          >
            {letter}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
