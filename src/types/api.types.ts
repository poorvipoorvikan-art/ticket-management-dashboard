export type ApiErrorType =
  | "network"
  | "timeout"
  | "client"
  | "server"
  | "unknown";

export interface ApiError {
  type: ApiErrorType;
  status?: number;
  message: string;
}