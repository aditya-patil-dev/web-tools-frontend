/* ---------------------------------
   Error Message Extractor
---------------------------------- */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

/* ---------------------------------
   Number Normalizer
---------------------------------- */
export function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
