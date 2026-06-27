/**
 * This file contains the definitions for the real-time events used in the application.
 */
export const REALTIME_EVENTS = {
    MONITORING_UPDATED: 'monitoring-update',
    INCIDENTS_UPDATED: 'incidents:updated',
    STATS_UPDATED: 'stats:updated',
} as const;

/**
 * This type represents the names of the real-time events defined in REALTIME_EVENTS.
 * It is derived from the keys of the REALTIME_EVENTS object.
 */
export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

/**
 * This interface defines the payload structure for the monitoring updated event.
 */
export interface MonitoringUpdatedPayload {
    id: string;
    service: {
        name: string;
        type: string;
        target: string;
        enabled: boolean;
    };
    status: string;
    statusCode: number | null;
    latencyMs: number | null;
    error: string | null;
    updatedAt: string;
}
/**
 * This interface defines the payload structure for the stats updated event.
 */
export interface StatsUpdatedPayload {
    totalServices: number;
    upServices: number;
    downServices: number;
    openIncidents: number;
}
/**
 * This interface defines the payload structure for the incidents updated event.
 */
export interface IncidentsUpdatedPayload {
    id: string;
    startedAt: string;
    resolvedAt: string | null;
    reason: string | null;
    service: { name: string };
}

/**
 * This type maps each real-time event to its corresponding payload structure.
 */
export type RealtimeEventMap = {
  [REALTIME_EVENTS.MONITORING_UPDATED]: MonitoringUpdatedPayload;
  [REALTIME_EVENTS.INCIDENTS_UPDATED]: IncidentsUpdatedPayload;
  [REALTIME_EVENTS.STATS_UPDATED]: StatsUpdatedPayload;
};