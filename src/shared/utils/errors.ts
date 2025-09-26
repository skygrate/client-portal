export function toErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybe = err as { message?: string; errors?: Array<{ message?: string }> };
    return maybe.errors?.[0]?.message || maybe.message || fallback;
  }
  return fallback;
}
