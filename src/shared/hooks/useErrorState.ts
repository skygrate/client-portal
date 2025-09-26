"use client";

import { useCallback, useState } from "react";
import { toErrorMessage } from "@shared/utils/errors";

export type ReportErrorInput =
  | string
  | {
      error: unknown;
      fallback: string;
      origin?: string;
      notify?: (message: string) => void;
      log?: boolean;
    };

export type ErrorReporter = {
  error: string | null;
  reportError: (input: ReportErrorInput) => string;
  clearError: () => void;
};

export function useErrorState(): ErrorReporter {
  const [error, setError] = useState<string | null>(null);

  const reportError = useCallback((input: ReportErrorInput) => {
    let message: string;
    if (typeof input === "string") {
      message = input;
    } else {
      message = toErrorMessage(input.error, input.fallback);
      if (input.log !== false) {
        console.error(`[Error:${input.origin ?? "unknown"}]`, input.error);
      }
      input.notify?.(message);
    }
    setError(message);
    return message;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, reportError, clearError };
}
