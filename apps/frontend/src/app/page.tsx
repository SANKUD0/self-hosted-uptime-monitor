"use client";

import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableFetchError } from "@/components/ui/fetch-error/table-fetch-error";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, incidentsResponse, servicesMonitoringResponse } from "@/lib/api";
import { Activity, AlertTriangle, ArrowDownCircle, ArrowUpCircle, ExternalLink, RefreshCw, Server } from "lucide-react";
import { useEffect, useState } from "react";

const DASHBOARD_REFRESH_INTERVAL_MS = 30000;

export default function Home() {
  const [count, setCount] = useState<number | null>(null);
  const [up, setUp] = useState<number | null>(null);
  const [down, setDown] = useState<number | null>(null);
  const [incidents, setIncidents] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState<string | null>(null);
  const [errorUp, setErrorUp] = useState<string | null>(null);
  const [errorDown, setErrorDown] = useState<string | null>(null);
  const [errorIncidents, setErrorIncidents] = useState<string | null>(null);

  const [monitoringData, setMonitoringData] = useState<servicesMonitoringResponse[]>([]);
  const [errorMonitoring, setErrorMonitoring] = useState<string | null>(null);

  const [incidentsData, setIncidentsData] = useState<incidentsResponse[]>([]);
  const [errorIncidentsData, setErrorIncidentsData] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasGlobalError, setHasGlobalError] = useState(false);

  const latencyItems = monitoringData
    .filter((entry) => entry.latencyMs !== null)
    .sort((a, b) => (b.latencyMs ?? 0) - (a.latencyMs ?? 0))
    .slice(0, 8)
    .map((entry) => ({
      id: entry.id,
      serviceName: entry.service.name,
      latencyMs: entry.latencyMs ?? 0,
      status: entry.status,
    }));

  const upCount = monitoringData.filter((entry) => entry.status === "UP").length;
  const downCount = monitoringData.filter((entry) => entry.status !== "UP").length;

  const refreshDashboardHttpData = async () => {
    setIsRefreshing(true);
    try {
      const [servicesCount, servicesUp, servicesDown, incidentsCount, incidentsList, monitoringList] = await Promise.all([
        api.services.getCount(),
        api.services.getCountUp(),
        api.services.getCountDown(),
        api.incidents.getCount(),
        api.incidents.getAll(),
        api.monitoring.getAll(),
      ]);

      setCount(servicesCount.count);
      setUp(servicesUp.upServices);
      setDown(servicesDown.downServices);
      setIncidents(incidentsCount.count);
      setIncidentsData(incidentsList);
      setMonitoringData(monitoringList);

      setErrorCount(null);
      setErrorUp(null);
      setErrorDown(null);
      setErrorIncidents(null);
      setErrorIncidentsData(null);
      setErrorMonitoring(null);
      setHasGlobalError(false);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      // Keep previous successful data on screen and expose the refresh failure in all widgets.
      setErrorCount(message);
      setErrorUp(message);
      setErrorDown(message);
      setErrorIncidents(message);
      setErrorIncidentsData(message);
      setErrorMonitoring(message);
      setHasGlobalError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load all dashboard data through HTTP first; this function can later be replaced by WebSocket event handlers.
    void refreshDashboardHttpData();

    // TODO: Replace polling with a WebSocket stream when backend events are available.
    // TODO: Expose a user setting to customize refresh frequency.

    const interval = setInterval(() => {
      void refreshDashboardHttpData();
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => {
      // Cleanup interval on component unmount.
      clearInterval(interval);
    };
  }, []);



  const formatDuration = (startedAt: string, resolvedAt: string | null) => {
    if (!resolvedAt) return null;
    const ms = new Date(resolvedAt).getTime() - new Date(startedAt).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* Page header with live status and manual refresh */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time overview of your monitored services and incidents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${hasGlobalError ? "bg-red-500" : "animate-ping bg-emerald-500"}`}
              />
              <span className={`relative inline-flex size-2 rounded-full ${hasGlobalError ? "bg-red-500" : "bg-emerald-500"}`} />
            </span>
            <span>
              {hasGlobalError
                ? "Connection issue"
                : lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : "Connecting…"}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshDashboardHttpData()}
            disabled={isRefreshing}
            className="cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <StatCard title="Registered Services" value={count} error={errorCount} icon={Server} accent="default" />
        <StatCard title="Services UP" value={up} error={errorUp} icon={ArrowUpCircle} accent="success" />
        <StatCard title="Services DOWN" value={down} error={errorDown} icon={ArrowDownCircle} accent="danger" />
        <StatCard title="Incidents OPEN" value={incidents} error={errorIncidents} icon={AlertTriangle} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Latency by Service</CardTitle>
            <CardDescription>Current HTTP snapshot sorted by highest latency</CardDescription>
          </CardHeader>
          <CardContent>
            <LatencyBarChart items={latencyItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Health Split</CardTitle>
            <CardDescription>Live UP vs DOWN ratio from HTTP polling</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceHealthDonut upCount={upCount} downCount={downCount} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Services Monitoring</CardTitle>
            <CardDescription>Latest status for all services — refreshed every 30s</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>HTTP Code</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorMonitoring ? (<TableFetchError colSpan={8} message={errorMonitoring} />) : monitoringData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No services are being monitored yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {monitoringData.map((entry) => (
                      <TableRow key={entry.id} className={entry.status === "DOWN" ? "bg-red-500/5" : ""}>
                        <TableCell className="font-medium">{entry.service.name}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.service.type}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {entry.service.target.startsWith("http://") || entry.service.target.startsWith("https://") ? (
                            <a
                              href={entry.service.target}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                              {entry.service.target}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            entry.service.target
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.service.enabled ? <span className="text-green-500 text-base cursor-default">✓</span> : <span className="text-red-500 text-base cursor-default">✗</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${entry.status === "UP"
                            ? "bg-green-500/15 text-green-600"
                            : "bg-red-500/15 text-red-600"
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${entry.status === "UP" ? "bg-green-500" : "bg-red-500"}`} />
                            {entry.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.latencyMs !== null ? `${entry.latencyMs} ms` : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.statusCode !== null ? `${entry.statusCode}` : "—"}
                        </TableCell>
                        <TableCell>
                          {entry.error
                            ? <span className="text-yellow-600 text-xs">{entry.error}</span>
                            : <span className="text-green-500 text-base">✓</span>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </>)}

              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="w-full pt-6">

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest incidents — refreshed every 30s</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorIncidentsData ? (<TableFetchError colSpan={6} message={errorIncidentsData} />) : incidentsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No incidents reported. All systems operational.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {incidentsData.map((entry) => {
                      const isOpen = !entry.resolvedAt;
                      const duration = formatDuration(entry.startedAt, entry.resolvedAt);
                      return (
                        <TableRow key={entry.id} className={isOpen ? "bg-red-500/5" : ""}>
                          <TableCell className="font-medium">{entry.service.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isOpen
                              ? "bg-red-500/15 text-red-600"
                              : "bg-green-500/15 text-green-600"
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-red-500" : "bg-green-500"}`} />
                              {isOpen ? "Open" : "Resolved"}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{entry.reason || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(entry.startedAt).toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">{entry.resolvedAt ? new Date(entry.resolvedAt).toLocaleString() : "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{duration ?? <span className="text-red-500 text-xs font-medium">Ongoing</span>}</TableCell>
                        </TableRow>
                      );
                    })}
                  </>)}

              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LatencyBarChart({
  items,
}: {
  items: Array<{ id: string; serviceName: string; latencyMs: number; status: string }>;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No latency data available yet.</p>;
  }

  const maxLatency = Math.max(...items.map((item) => item.latencyMs), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const widthPercent = Math.max((item.latencyMs / maxLatency) * 100, 4);
        return (
          <div key={item.id} className="grid grid-cols-[180px_1fr_72px] items-center gap-3">
            <p className="truncate text-sm font-medium" title={item.serviceName}>
              {item.serviceName}
            </p>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all ${item.status === "UP" ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            <p className="text-right text-xs text-muted-foreground">{item.latencyMs} ms</p>
          </div>
        );
      })}
    </div>
  );
}

function ServiceHealthDonut({ upCount, downCount }: { upCount: number; downCount: number }) {
  const total = upCount + downCount;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No service health data available yet.</p>;
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const upRatio = upCount / total;
  const upStroke = circumference * upRatio;
  const downStroke = circumference - upStroke;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
          <circle cx="70" cy="70" r={radius} className="fill-none stroke-muted" strokeWidth="14" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="fill-none stroke-emerald-500"
            strokeWidth="14"
            strokeDasharray={`${upStroke} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="fill-none stroke-red-500"
            strokeWidth="14"
            strokeDasharray={`${downStroke} ${circumference}`}
            strokeDashoffset={-upStroke}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Services</p>
          <p className="text-xl font-bold">{total}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>UP: {upCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>DOWN: {downCount}</span>
        </div>
      </div>
    </div>
  );
}
