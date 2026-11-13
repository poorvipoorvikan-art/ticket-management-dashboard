import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryMeta,
  type FetchBaseQueryError
} from "@reduxjs/toolkit/query/react";
import type { ApiError } from "../types/api.types";

const baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
  throw new Error("VITE_API_URL is not configured");
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  timeout: 10000,
  headers: {
    Accept: "application/json"
  }
});

function shouldRetry(
  error: FetchBaseQueryError,
  method: string
): boolean {
  if (method !== "GET") {
    return false;
  }

  if (typeof error.status === "number") {
    return [408, 429, 500, 502, 503, 504].includes(error.status);
  }

  return (
    error.status === "FETCH_ERROR" ||
    error.status === "TIMEOUT_ERROR"
  );
}

function normalizeApiError(error: FetchBaseQueryError): ApiError {
  if (typeof error.status === "number") {
    const messages: Record<number, string> = {
      400: "Invalid request. Please check the submitted information.",
      401: "Your session has expired. Please log in again.",
      403: "You do not have permission to perform this action.",
      404: "The requested resource was not found.",
      408: "The request timed out. Please try again.",
      409: "The request conflicts with existing data.",
      422: "The submitted information could not be processed.",
      429: "Too many requests. Please try again later.",
      500: "Internal server error. Please try again later.",
      502: "The server is temporarily unavailable.",
      503: "The service is currently unavailable.",
      504: "The server took too long to respond."
    };

    return {
      type: error.status >= 500 ? "server" : "client",
      status: error.status,
      message:
        messages[error.status] ??
        (error.status >= 500
          ? "A server error occurred. Please try again later."
          : "The request could not be completed. Please try again.")
    };
  }

  if (error.status === "TIMEOUT_ERROR") {
    return {
      type: "timeout",
      message: "The request timed out. Please try again."
    };
  }

  if (error.status === "FETCH_ERROR") {
    return {
      type: "network",
      message: "Unable to connect to the server. Check your internet connection."
    };
  }

  if (error.status === "PARSING_ERROR") {
    return {
      type: "server",
      status: error.originalStatus,
      message: "The server returned an invalid response."
    };
  }

  return {
    type: "unknown",
    message: "An unexpected error occurred. Please try again."
  };
}

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const method =
    typeof args === "string"
      ? "GET"
      : (args.method ?? "GET").toUpperCase();

  let result = await rawBaseQuery(args, api, extraOptions);
  let retries = 0;
  const maxRetries = 2;

  while (
    result.error &&
    retries < maxRetries &&
    shouldRetry(result.error, method)
  ) {
    retries += 1;

    await new Promise((resolve) =>
      setTimeout(resolve, 500 * 2 ** (retries - 1))
    );

    result = await rawBaseQuery(args, api, extraOptions);
  }

  if (result.error) {
    if (result.error.status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return {
      error: normalizeApiError(result.error),
      meta: result.meta
    };
  }

  return {
    data: result.data,
    meta: result.meta
  };
};