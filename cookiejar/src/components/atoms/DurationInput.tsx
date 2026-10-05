import { useState } from 'react';

import { TextField } from '@/components/primitives/TextField';
import { formatDuration } from '@/dates/formatDuration';
import { parseDuration } from '@/dates/parseDuration';

type DurationInputProperties = {
  seconds: number | null;
  accessibilityLabel: string;
  placeholder?: string;
  onFocus?: () => void;
  onChangeSeconds: (seconds: number | null) => void;
};

function formatDurationText(seconds: number | null) {
  return seconds === null ? '' : formatDuration(seconds);
}

export function DurationInput({
  seconds,
  accessibilityLabel,
  placeholder,
  onFocus,
  onChangeSeconds,
}: DurationInputProperties) {
  const [text, setText] = useState(() => formatDurationText(seconds));
  const [shownSeconds, setShownSeconds] = useState(seconds);

  if (seconds !== shownSeconds) {
    setShownSeconds(seconds);
    setText(formatDurationText(seconds));
  }

  const changeText = (newText: string) => {
    setText(newText);
    const parsedSeconds = newText.trim().length === 0 ? null : parseDuration(newText);
    if (parsedSeconds === null && newText.trim().length > 0) {
      return;
    }
    setShownSeconds(parsedSeconds);
    onChangeSeconds(parsedSeconds);
  };

  return (
    <TextField
      value={text}
      onChangeText={changeText}
      onEndEditing={() => setText(formatDurationText(seconds))}
      keyboardType="numbers-and-punctuation"
      autoCapitalize="none"
      autoCorrect={false}
      selectTextOnFocus
      onFocus={onFocus}
      returnKeyType="done"
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      style={{ textAlign: 'center' }}
    />
  );
}
