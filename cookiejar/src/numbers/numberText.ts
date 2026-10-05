export type ParsedNumberText = { isAccepted: false } | { isAccepted: true; value: number | null };

function numberTextPattern(decimalPlaces: number) {
  return decimalPlaces === 0 ? /^\d*$/ : new RegExp(`^\\d*(\\.\\d{0,${decimalPlaces}})?$`);
}

function normaliseNumberText(text: string) {
  return text.trim().replace(',', '.');
}

export function parseNumberText(text: string, decimalPlaces: number): ParsedNumberText {
  const normalisedText = normaliseNumberText(text);
  if (!numberTextPattern(decimalPlaces).test(normalisedText)) {
    return { isAccepted: false };
  }
  const digits = normalisedText.replace('.', '');
  return { isAccepted: true, value: digits.length === 0 ? null : Number(normalisedText) };
}

export function formatNumberText(value: number | null) {
  return value === null ? '' : String(value);
}
