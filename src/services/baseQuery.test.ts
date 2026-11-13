import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { baseQuery } from "./baseQuery";

const mockApi = {
  signal: new AbortController().signal,
  abort: vi.fn(),
  dispatch: vi.fn(),
  getState: vi.fn(),
  extra: {},
  endpoint: "testEndpoint",
  type: "query",
  forced: false,
  queryCacheKey: "testEndpoint"
} as unknown as BaseQueryApi;

describe("baseQuery", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns data when the API request succeeds", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify([{ id: "TKT-101", title: "Test ticket" }]),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    const result = await baseQuery("/tickets", mockApi, {});

    expect(result.data).toEqual([
      { id: "TKT-101", title: "Test ticket" }
    ]);
    expect(result.error).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("normalizes HTTP 400 errors", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Invalid request" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    const result = await baseQuery("/tickets", mockApi, {});

    expect(result.error).toEqual({
      type: "client",
      status: 400,
      message: "Invalid request. Please check the submitted information."
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("normalizes HTTP 404 errors", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    const result = await baseQuery("/tickets/999", mockApi, {});

    expect(result.error).toEqual({
      type: "client",
      status: 404,
      message: "The requested resource was not found."
    });
  });

  it("normalizes HTTP 500 errors and retries twice", async () => {
    vi.mocked(fetch).mockImplementation(async () =>
      new Response(
        JSON.stringify({ message: "Internal error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    const result = await baseQuery("/tickets", mockApi, {});

    expect(result.error).toEqual({
      type: "server",
      status: 500,
      message: "Internal server error. Please try again later."
    });

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("dispatches an unauthorized event for HTTP 401", async () => {
    const unauthorizedHandler = vi.fn();

    window.addEventListener(
      "auth:unauthorized",
      unauthorizedHandler
    );

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    const result = await baseQuery("/tickets", mockApi, {});

    expect(result.error).toEqual({
      type: "client",
      status: 401,
      message: "Your session has expired. Please log in again."
    });

    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);

    window.removeEventListener(
      "auth:unauthorized",
      unauthorizedHandler
    );
  });

  it("does not retry POST requests", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    const result = await baseQuery(
      {
        url: "/tickets",
        method: "POST",
        body: { title: "Test ticket" }
      },
      mockApi,
      {}
    );

    expect(result.error?.status).toBe(500);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("handles network failures and retries twice", async () => {
    vi.mocked(fetch).mockRejectedValue(
      new TypeError("Failed to fetch")
    );

    const result = await baseQuery("/tickets", mockApi, {});

    expect(result.error).toEqual({
      type: "network",
      message: "Unable to connect to the server. Check your internet connection."
    });

    expect(fetch).toHaveBeenCalledTimes(3);
  });
});