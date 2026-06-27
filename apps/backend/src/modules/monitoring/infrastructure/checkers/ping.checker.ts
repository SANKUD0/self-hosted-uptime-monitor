import { Injectable } from '@nestjs/common';
import * as ping from 'ping';
import { Checker, CheckResult } from '../../domain/checker.interface';

@Injectable()
export class PingChecker implements Checker {
  async check(target: string, timeoutMs: number): Promise<CheckResult> {
    const startTime = performance.now();

    try {
      const result = await ping.promise.probe(target, {
        timeout: Math.ceil(timeoutMs / 1000), // ping expects seconds
        min_reply: 1,
        extra: ['-n', '1'], // Windows: one packet. Linux equivalent: '-c 1'.
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (result.alive) {
        // result.time is in ms and may be 'unknown' if not parseable.
        const pingTime =
          typeof result.time === 'number' ? Math.round(result.time) : latencyMs;

        return {
          status: 'UP',
          latencyMs: pingTime,
        };
      }

      return {
        status: 'DOWN',
        latencyMs,
        error: result.output || 'Host did not respond',
      };
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        status: 'DOWN',
        latencyMs,
        error: errorMessage,
      };
    }
  }
}