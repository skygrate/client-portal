import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useErrorState } from "../useErrorState";

describe("useErrorState", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports string errors and clears them", () => {
    const { result } = renderHook(() => useErrorState());

    expect(result.current.error).toBeNull();

    act(() => {
      const returned = result.current.reportError("Something went wrong");
      expect(returned).toBe("Something went wrong");
    });

    expect(result.current.error).toBe("Something went wrong");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("formats object input, logs and notifies", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const notify = vi.fn();
    const { result } = renderHook(() => useErrorState());

    const error = new Error("Boom");

    act(() => {
      result.current.reportError({
        error,
        fallback: "Friendly message",
        origin: "test",
        notify,
      });
    });

    expect(result.current.error).toBe("Friendly message");
    expect(consoleSpy).toHaveBeenCalledWith("[Error:test]", error);
    expect(notify).toHaveBeenCalledWith("Friendly message");
  });
});
