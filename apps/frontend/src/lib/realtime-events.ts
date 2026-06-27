export const REALTIME_EVENTS = {
    MONITORING_UPDATED: 'monitoring-update',
    INCIDENTS_UPDATED: 'incidents:updated',
    STATS_UPDATED: 'stats:updated',
} as const;

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

export interface StatsUpdatedPayload {
  totalServices: number;
  upServices: number;
  downServices: number;
  openIncidents: number;
}

export interface IncidentsUpdatedPayload {
  id: string;
  startedAt: string;
  resolvedAt: string | null;
  reason: string | null;
  service: { name: string };
}