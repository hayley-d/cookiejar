export type ValueAxis = {
  minimum: number;
  maximum: number;
  ticks: [number, number, number];
};

const stepMultipliers = [1, 2, 2.5, 3, 4, 5, 6, 8, 10];
const roundingTolerance = 1e-9;

function cleanNumber(value: number): number {
  return Number(value.toPrecision(12));
}

function candidateSteps(smallestStep: number): number[] {
  const magnitude = 10 ** Math.floor(Math.log10(smallestStep));
  return [magnitude, magnitude * 10].flatMap((base) =>
    stepMultipliers.map((multiplier) => cleanNumber(base * multiplier)),
  );
}

export function fitValueAxis(values: number[]): ValueAxis {
  const dataValues = values.length === 0 ? [0] : values;
  const smallestValue = Math.min(...dataValues);
  const largestValue = Math.max(...dataValues);
  const isFlat = smallestValue === largestValue;
  const low = isFlat ? smallestValue - 1 : smallestValue;
  const high = isFlat ? largestValue + 1 : largestValue;
  const smallestStep = (high - low) / 2;

  for (const step of candidateSteps(smallestStep)) {
    if (step < smallestStep - roundingTolerance) {
      continue;
    }
    const alignment = 10 ** Math.floor(Math.log10(step));
    const minimum = cleanNumber(Math.floor(low / alignment + roundingTolerance) * alignment);
    const maximum = cleanNumber(minimum + step * 2);
    if (maximum >= high - roundingTolerance) {
      return { minimum, maximum, ticks: [minimum, cleanNumber(minimum + step), maximum] };
    }
  }

  return { minimum: low, maximum: high, ticks: [low, cleanNumber((low + high) / 2), high] };
}
