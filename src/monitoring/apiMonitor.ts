import { logger } from "./logger";

export interface ApiRequestRecord {
  id: number;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number | string;
  durationMs: number;
  success: boolean;
  attempt: number;
  errorType?: string;
}

export interface ApiMonitoringSnapshot {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageDurationMs: number;
  recentRequests: ApiRequestRecord[];
  failuresByEndpoint: {
    endpoint: string;
    method: string;
    failures: number;
  }[];
}

const MAX_RECORDS = 100;

let nextId = 1;
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
let totalDuration = 0;

const recentRequests: ApiRequestRecord[] = [];
const failureCounts = new Map<string, number>();
const listeners = new Set<() => void>();

let snapshot: ApiMonitoringSnapshot = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageDurationMs: 0,
  recentRequests: [],
  failuresByEndpoint: []
};

const updateSnapshot = () => {
  snapshot = {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageDurationMs:
      totalRequests > 0
        ? Math.round((totalDuration / totalRequests) * 100) / 100
        : 0,
    recentRequests: [...recentRequests],
    failuresByEndpoint: Array.from(
      failureCounts,
      ([key, failures]) => {
        const [endpoint, method] = key.split("::");

        return {
          endpoint,
          method,
          failures
        };
      }
    ).sort((a, b) => b.failures - a.failures)
  };

  listeners.forEach((listener) => listener());
};

export const recordApiRequest = (
  request: Omit<ApiRequestRecord, "id" | "timestamp">
) => {
  const record: ApiRequestRecord = {
    ...request,
    id: nextId++,
    timestamp: new Date().toISOString()
  };

  totalRequests += 1;
  totalDuration += record.durationMs;

  if (record.success) {
    successfulRequests += 1;

    logger.info("API request completed", {
      endpoint: record.endpoint,
      method: record.method,
      status: record.status,
      durationMs: record.durationMs,
      attempt: record.attempt
    });
  } else {
    failedRequests += 1;

    const key = `${record.endpoint}::${record.method}`;

    failureCounts.set(
      key,
      (failureCounts.get(key) ?? 0) + 1
    );

    const logContext = {
      endpoint: record.endpoint,
      method: record.method,
      status: record.status,
      durationMs: record.durationMs,
      attempt: record.attempt,
      errorType: record.errorType
    };

    if (request.attempt > 0 && request.errorType === "RETRYING") {
      logger.warn("API request failed; retrying", logContext);
    } else {
      logger.error("API request failed", logContext);
    }
  }

  recentRequests.unshift(record);

  if (recentRequests.length > MAX_RECORDS) {
    recentRequests.pop();
  }

  updateSnapshot();
};

export const getApiMonitoringSnapshot = () => snapshot;

export const subscribeApiMonitoring = (
  listener: () => void
) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const resetApiMonitoring = () => {
  nextId = 1;
  totalRequests = 0;
  successfulRequests = 0;
  failedRequests = 0;
  totalDuration = 0;
  recentRequests.length = 0;
  failureCounts.clear();

  updateSnapshot();
};