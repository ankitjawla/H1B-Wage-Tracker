import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce(100, 300));
    expect(result.current).toBe(100);
  });

  it("should not update until the delay has elapsed", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 100 },
    });

    rerender({ value: 200 });
    expect(result.current).toBe(100);

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe(100);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(200);
  });

  it("should reset the timer on rapid changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 3 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(3);
  });
});
