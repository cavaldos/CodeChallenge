export function toIsoOrNull(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
