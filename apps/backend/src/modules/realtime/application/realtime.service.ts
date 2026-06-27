import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from '../infrastructure/realtime.gateway';
import {
  REALTIME_EVENTS,
  MonitoringUpdatedPayload,
  IncidentsUpdatedPayload,
  StatsUpdatedPayload,
} from '../domain/realtime-events';

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  broadcastMonitoringUpdate(payload: MonitoringUpdatedPayload): void {
    this.gateway.broadcast(REALTIME_EVENTS.MONITORING_UPDATED, payload);
  }

  broadcastIncidentsUpdate(payload: IncidentsUpdatedPayload): void {
    this.gateway.broadcast(REALTIME_EVENTS.INCIDENTS_UPDATED, payload);
  }

  broadcastStatsUpdate(payload: StatsUpdatedPayload): void {
    this.gateway.broadcast(REALTIME_EVENTS.STATS_UPDATED, payload);
  }
}    