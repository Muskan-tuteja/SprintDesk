import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useToast } from "./useToast";

describe("useToast", () => {
  it("shows a toast message", () => {
    const { result } = renderHook(() =>
      useToast()
    );

    act(() => {
      result.current.showToast(
        "Task created successfully"
      );
    });

    expect(result.current.toasts).toHaveLength(1);

    expect(
      result.current.toasts[0].message
    ).toBe(
      "Task created successfully"
    );
  });

  it("removes a toast", () => {
    const { result } = renderHook(() =>
      useToast()
    );

    act(() => {
      result.current.showToast("Hello");
    });

    const toastId =
      result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("automatically removes toast", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useToast()
    );

    act(() => {
      result.current.showToast("Saved");
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(result.current.toasts).toHaveLength(0);

    vi.useRealTimers();
  });
});