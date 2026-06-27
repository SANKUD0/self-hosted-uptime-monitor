import { Injectable, HttpStatus } from '@nestjs/common';
import { Socket } from 'net';
import { Checker, CheckResult } from '../../domain/checker.interface';

@Injectable()
export class TcpChecker implements Checker {
  async check(target: string, timeoutMs: number): Promise<CheckResult> {
    const startTime = performance.now();

    // Parse target in "host:port" format.
    const parsed = this.parseTarget(target);
    if (!parsed) {
      return {
        status: 'DOWN',
        latencyMs: 0,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: `Invalid format. Expected "host:port", received "${target}"`,
      };
    }

    const { host, port } = parsed;

    return new Promise<CheckResult>((resolve) => {
      const socket = new Socket();
      let resolved = false;

      // Helper to prevent resolving the Promise more than once.
      const finish = (result: CheckResult) => {
        if (resolved) return;
        resolved = true;
        socket.destroy();
        resolve(result);
      };

      // Configure socket timeout.
      socket.setTimeout(timeoutMs);

      // Event: connection established.
      socket.on('connect', () => {
        const latencyMs = Math.round(performance.now() - startTime);
        finish({
          status: 'UP',
          latencyMs,
          statusCode: HttpStatus.OK,
        });
      });

      // Event: timeout.
      socket.on('timeout', () => {
        const latencyMs = Math.round(performance.now() - startTime);
        finish({
          status: 'TIMEOUT',
          latencyMs,
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          error: `Connection timeout after ${timeoutMs}ms`,
        });
      });

      // Event: connection error (refused, unknown host, etc.).
      socket.on('error', (err) => {
        const latencyMs = Math.round(performance.now() - startTime);
        finish({
          status: 'DOWN',
          latencyMs,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: err.message,
        });
      });

      // Start TCP connection attempt.
      socket.connect(port, host);
    });
  }

  private parseTarget(target: string): { host: string; port: number } | null {
    const lastColon = target.lastIndexOf(':');
    if (lastColon === -1) return null;

    const host = target.substring(0, lastColon);
    const portStr = target.substring(lastColon + 1);
    const port = Number(portStr);

    if (!host || isNaN(port) || port < 1 || port > 65535) {
      return null;
    }

    return { host, port };
  }
}