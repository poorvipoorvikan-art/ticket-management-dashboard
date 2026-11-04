import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("VITE_API_URL is not configured");
}

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === "ERR_CANCELED") {
        return Promise.reject(new Error("Request was cancelled"));
      }

      if (error.code === "ECONNABORTED") {
        return Promise.reject(new Error("The request timed out"));
      }

      if (!error.response) {
        return Promise.reject(new Error("Network error. Check your connection."));
      }

      const messages: Record<number, string> = {
        400: "Bad request. Please check the submitted information.",
        401: "Unauthorized. Please log in again.",
        403: "You do not have permission to perform this action.",
        404: "The requested resource was not found.",
        500: "Internal server error. Please try again later."
      };

      return Promise.reject(
        new Error(messages[error.response.status] ?? "An unexpected API error occurred.")
      );
    }

    return Promise.reject(new Error("An unexpected error occurred."));
  }
);