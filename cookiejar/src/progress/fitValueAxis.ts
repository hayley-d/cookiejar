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

type ValueAxisOptions = {
  startsAtZero?: boolean;
};

function dataBounds(values: number[], startsAtZero: boolean) {
  const dataValues = values.length === 0 ? [0] : values;
  const smallestValue = Math.min(...dataValues);
  const largestValue = Math.max(...dataValues);
  if (startsAtZero) {
    const low = Math.min(0, smallestValue);
    return { low, high: largestValue > low ? largestValue : low + 1 };
  }
  const isFlat = smallestValue === largestValue;
  return { low: isFlat ? smallestValue - 1 : smallestValue, high: isFlat ? largestValue + 1 : largestValue };
}

export function fitValueAxis(values: number[], { startsAtZero = false }: ValueAxisOptions = {}): ValueAxis {
  const { low, high } = dataBounds(values, startsAtZero);
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
