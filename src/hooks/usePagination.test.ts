import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  it("should start on page 1", () => {
    const { result } = renderHook(() => usePagination(20));

    expect(result.current.currentPage).toBe(1);
  });

  it("should calculate total pages", () => {
    const { result } = renderHook(() => usePagination(20, 5));

    expect(result.current.totalPages).toBe(4);
  });

  it("should calculate start and end indexes", () => {
    const { result } = renderHook(() => usePagination(20, 5));

    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(5);
  });

  it("should move to the next page", () => {
    const { result } = renderHook(() => usePagination(20, 5));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("should move to the previous page", () => {
    const { result } = renderHook(() => usePagination(20, 5));

    act(() => {
      result.current.changePage(3);
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("should change to a specific page", () => {
    const { result } = renderHook(() => usePagination(20, 5));

    act(() => {
      result.current.changePage(3);
    });

    expect(result.current.currentPage).toBe(3);
  });

  it("should not move beyond the last page", () => {
    const { result } = renderHook(() => usePagination(10, 5));

    act(() => {
      result.current.changePage(2);
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("should not move before the first page", () => {
    const { result } = renderHook(() => usePagination(20, 5));

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);
  });
});