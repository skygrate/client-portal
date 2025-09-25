"use client";

import { useCallback, useState } from "react";

type ConfirmMessage = string | (() => string);

type AsyncActionOptions<TArgs extends unknown[]> = {
  action: (...args: TArgs) => Promise<void> | void;
  confirmMessage?: ConfirmMessage;
  onError?: (error: unknown) => void;
};

export function useAsyncAction<TArgs extends unknown[]>({ action, confirmMessage, onError }: AsyncActionOptions<TArgs>) {
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (...args: TArgs) => {
      if (confirmMessage) {
        const message = typeof confirmMessage === "function" ? confirmMessage() : confirmMessage;
        const ok = confirm(message);
        if (!ok) return;
      }
      setBusy(true);
      try {
        await action(...args);
      } catch (error) {
        onError?.(error);
      } finally {
        setBusy(false);
      }
    },
    [action, confirmMessage, onError]
  );

  return { run, busy } as const;
}
