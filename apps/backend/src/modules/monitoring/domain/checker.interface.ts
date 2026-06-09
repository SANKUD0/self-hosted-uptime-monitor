import { CheckStatus } from '@prisma/client';

/**
 * Result of a health check performed on a service.
 * Value Object semantics: immutable, identity-less, data-only.
 */
export interface CheckResult {
  status: CheckStatus;
  latencyMs: number;
  statusCode?: number;
  error?: string;
}

/**
 * Contract implemented by all checkers.
 * Enables the Strategy pattern so checker implementations can be swapped
 * without changing the caller logic.
 */
export interface Checker {
  /**
   * Runs a check against a target and returns the result.
   *
   * @param target - HTTP URL, TCP host:port, etc., depending on implementation
   * @param timeoutMs - maximum duration before considering the check timed out
   * @returns Check result (never throws; always returns a CheckResult)
   */
  check(target: string, timeoutMs: number): Promise<CheckResult>;
}