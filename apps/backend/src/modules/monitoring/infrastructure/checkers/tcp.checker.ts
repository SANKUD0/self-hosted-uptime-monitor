import { Injectable, HttpStatus } from '@nestjs/common';
import { Socket } from 'net';
import { Checker, CheckResult } from '../../domain/checker.interface';

@Injectable()
export class TcpChecker implements Checker {
  async check(target: string, timeoutMs: number): Promise<CheckResult> {
    const startTime = performance.now();

    // Parser le target "host:port"
    const parsed = this.parseTarget(target);
    if (!parsed) {
      return {
        status: 'DOWN',
        latencyMs: 0,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: `Format invalide. Attendu: "host:port", reçu: "${target}"`,
      };
    }

    const { host, port } = parsed;

    return new Promise<CheckResult>((resolve) => {
      const socket = new Socket();
      let resolved = false;

      // Helper pour éviter de résoudre 2 fois la Promise
      const finish = (result: CheckResult) => {
        if (resolved) return;
        resolved = true;
        socket.destroy();
        resolve(result);
      };

      // Définir le timeout
      socket.setTimeout(timeoutMs);

      // Événement : connexion réussie
      socket.on('connect', () => {
        const latencyMs = Math.round(performance.now() - startTime);
        finish({
          status: 'UP',
          latencyMs,
          statusCode: HttpStatus.OK,
        });
      });

      // Événement : timeout
      socket.on('timeout', () => {
        const latencyMs = Math.round(performance.now() - startTime);
        finish({
          status: 'TIMEOUT',
          latencyMs,
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          error: `Connection timeout après ${timeoutMs}ms`,
        });
      });

      // Événement : erreur (connexion refusée, host inconnu, etc.)
      socket.on('error', (err) => {
        const latencyMs = Math.round(performance.now() - startTime);
        finish({
          status: 'DOWN',
          latencyMs,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: err.message,
        });
      });

      // Lancer la connexion
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