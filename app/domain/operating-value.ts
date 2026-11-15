import type { Money } from "./money";

export type OperatingValueMeasurement = Readonly<{
  baselineMinutes: number;
  assistedMinutes: number;
  minutesSaved: number;
  loadedHourlyRate: Money;
  value: Money;
}>;

/**
 * Converts measured task-time reduction into a monetary operating-value estimate.
 * It is not cash recovery and must remain separate from realized financial value.
 */
export function calculateOperatingValue(
  baselineMinutes: number,
  assistedMinutes: number,
  loadedHourlyRate: Money,
): OperatingValueMeasurement {
  if (!Number.isSafeInteger(baselineMinutes) || baselineMinutes < 1 || baselineMinutes > 100_000) {
    throw new Error("Baseline task time must be a whole number between 1 and 100,000 minutes.");
  }
  if (!Number.isSafeInteger(assistedMinutes) || assistedMinutes < 0 || assistedMinutes > 100_000) {
    throw new Error("NODUS-assisted task time must be a whole number between 0 and 100,000 minutes.");
  }
  if (baselineMinutes <= assistedMinutes) {
    throw new Error("Baseline task time must exceed NODUS-assisted task time.");
  }
  if (loadedHourlyRate.minor <= 0n) {
    throw new Error("Loaded hourly labor rate must be greater than zero.");
  }

  const minutesSaved = baselineMinutes - assistedMinutes;
  const valueMinor = (BigInt(minutesSaved) * loadedHourlyRate.minor + 30n) / 60n;
  if (valueMinor <= 0n) {
    throw new Error("Measured time value rounds to zero at the selected currency precision.");
  }

  return {
    baselineMinutes,
    assistedMinutes,
    minutesSaved,
    loadedHourlyRate,
    value: { minor: valueMinor, currency: loadedHourlyRate.currency },
  };
}
