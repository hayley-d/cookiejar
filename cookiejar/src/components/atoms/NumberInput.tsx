import { useState } from 'react';

import { TextField } from '@/components/primitives/TextField';
import { formatNumberText, parseNumberText } from '@/numbers/numberText';

type NumberInputProperties = {
  value: number | null;
  decimalPlaces: number;
  accessibilityLabel: string;
  placeholder?: string;
  onFocus?: () => void;
  onChangeValue: (value: number | null) => void;
};

export function NumberInput({
  value,
  decimalPlaces,
  accessibilityLabel,
  placeholder,
  onFocus,
  onChangeValue,
}: NumberInputProperties) {
  const [text, setText] = useState(() => formatNumberText(value));
  const [shownValue, setShownValue] = useState(value);

  if (value !== shownValue) {
    setShownValue(value);
    setText(formatNumberText(value));
  }

  const changeText = (newText: string) => {
    const parsedText = parseNumberText(newText, decimalPlaces);
    if (!parsedText.isAccepted) {
      return;
    }
    setText(newText);
    setShownValue(parsedText.value);
    onChangeValue(parsedText.value);
  };

  return (
    <TextField
      value={text}
      onChangeText={changeText}
      onEndEditing={() => setText(formatNumberText(value))}
      keyboardType={decimalPlaces === 0 ? 'number-pad' : 'decimal-pad'}
      selectTextOnFocus
      onFocus={onFocus}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      style={{ textAlign: 'center' }}
    />
  );
}
