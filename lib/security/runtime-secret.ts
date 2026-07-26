export function resolveRuntimeSecret(
  name: string,
  value: string | undefined,
  developmentFallback: string,
  isProduction = process.env.NODE_ENV === "production"
): string {
  if (value) return value;
  if (isProduction) {
    throw new Error(`${name} is required in production`);
  }
  return developmentFallback;
}
