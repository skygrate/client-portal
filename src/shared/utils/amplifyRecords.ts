export function toRecordArray(input: unknown): Record<string, unknown>[] {
  const arr = input as Array<Record<string, unknown> | null | undefined> | undefined;
  return (arr ?? []).filter((item): item is Record<string, unknown> => Boolean(item));
}
