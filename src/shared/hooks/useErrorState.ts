"use client";

import { useCallback, useState } from "react";

export type ErrorReporter = {
  error: string | null;
  reportError: (message: string) => void;
  clearError: () => void;
};

export function useErrorState(): ErrorReporter {
  const [error, setError] = useState<string | null>(null);

  const reportError = useCallback((message: string) => {
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, reportError, clearError };
}
