import { Injectable } from "@nestjs/common";
import { Checker, CheckResult } from "../../domain/checker.interface";
import { request } from 'undici';

@Injectable()
export class HttpChecker implements Checker {
    async check(target: string, timeoutMs: number): Promise<CheckResult> {
        const startTime = performance.now();
        try {
            const response = await request(target, {
                method: 'GET',
                headersTimeout: timeoutMs,
                bodyTimeout: timeoutMs,
                // Keep disabled to measure direct target response only.
                //maxRedirections: 0 
            });
            const latencyMs = Math.round(performance.now() - startTime);
            const statusCode = response.statusCode;
            // Consume response body to release the underlying connection.
            await response.body.dump();
            // 2xx/3xx are considered healthy. 4xx/5xx are considered DOWN.
            const isHealthy = statusCode >= 200 && statusCode < 400;

            return {
                status: isHealthy ? 'UP' : 'DOWN',
                latencyMs,
                statusCode,
                error: isHealthy ? undefined : `HTTP ${statusCode}`,
            };

        } catch (error) {
            const latencyMs = Math.round(performance.now() - startTime);
            // Timeout detection based on undici error signatures.
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const isTimeOut = errorMessage.includes('timeout') ||
                errorMessage.includes('UND_ERR_HEADERS_TIMEOUT') ||
                errorMessage.includes('UND_ERR_BODY_TIMEOUT');
            return {
                status: isTimeOut ? 'TIMEOUT' : 'DOWN',
                latencyMs,
                error: errorMessage
            }
        }
    }



}
