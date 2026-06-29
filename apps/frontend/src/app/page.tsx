"use client";

import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TableFetchError } from "@/components/ui/fetch-error/table-fetch-error";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRealtimeSocket } from "@/hooks/useRealTimeSocket";
import { api, incidentsResponse, servicesMonitoringResponse } from "@/lib/api";
import { REALTIME_EVENTS } from "@/lib/realtime-events";
import { Activity, AlertTriangle, ArrowDownCircle, ArrowUpCircle, CheckCircle2, ChevronRight, Clock, ExternalLink, RefreshCw, Server } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Label, PieChart, Pie, BarChart, Bar, CartesianGrid, XAxis, YAxis, RadialBarChart, PolarGrid, RadialBar, PolarRadiusAxis, AreaChart, Area } from "recharts";

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
  const downCount = monitoringData.filter((entry) => entry.status === "DOWN").length;
  const timeoutCount = monitoringData.filter((entry) => entry.status === "TIMEOUT").length;

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

    // const interval = setInterval(() => {
    //   void refreshDashboardHttpData();
    // }, DASHBOARD_REFRESH_INTERVAL_MS);

    // return () => {
    //   // Cleanup interval on component unmount.
    //   clearInterval(interval);
    // };
  }, []);

  useRealtimeSocket({
    [REALTIME_EVENTS.MONITORING_UPDATED]: (payload) => {
      const data = payload as servicesMonitoringResponse;
      setMonitoringData(prev =>
        prev.map(entry => entry.id === data.id ? data : entry)
      );
    },
    [REALTIME_EVENTS.STATS_UPDATED]: (payload) => {
      const data = payload as { totalServices: number; upServices: number; downServices: number; openIncidents: number };
      setCount(data.totalServices);
      setUp(data.upServices);
      setDown(data.downServices);
      setIncidents(data.openIncidents);
    },
    [REALTIME_EVENTS.INCIDENTS_UPDATED]: (payload) => {
      const data = payload as incidentsResponse;
      setIncidentsData(prev => {
        const exists = prev.find(e => e.id === data.id);
        if (exists) return prev.map(e => e.id === data.id ? data : e);
        return [data, ...prev];
      });
    },
  });



  const formatDuration = (startedAt: string, resolvedAt: string | null) => {
    if (!resolvedAt) return null;
    const ms = new Date(resolvedAt).getTime() - new Date(startedAt).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const ms = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
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
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-5">
        <StatCard title="Registered Services" value={count} error={errorCount} icon={Server} accent="default" />
        <StatCard title="Services UP" value={up} error={errorUp} icon={ArrowUpCircle} accent="success" />
        <StatCard title="Services DOWN" value={down} error={errorDown} icon={ArrowDownCircle} accent="danger" />
        <StatCard title="Incidents OPEN" value={incidents} error={errorIncidents} icon={AlertTriangle} accent="warning" />

        {/* Nouveau */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="size-4" />
              MTTR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MTTRStat incidents={incidentsData} />
          </CardContent>
        </Card>
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
            <CardDescription>Live UP vs DOWN ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceHealthDonut upCount={upCount} downCount={downCount} timeoutCount={timeoutCount} />
          </CardContent>
        </Card>
      </div>

      {/* Nouvelle ligne avec les 2 nouveaux charts */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incidents Over Time</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentsOverTimeChart incidents={incidentsData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Uptime</CardTitle>
            <CardDescription>Percentage of services currently UP</CardDescription>
          </CardHeader>
          <CardContent>
            <UptimeRadialChart upCount={upCount} total={upCount + downCount + timeoutCount} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Services Monitoring</CardTitle>
            <CardDescription>Latest status for all services — live via WebSocket</CardDescription>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Latest incidents — live via WebSocket</CardDescription>
            </div>
            {incidentsData.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/incidents" className="text-xs">
                  View all
                  <ChevronRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {errorIncidentsData ? (
              <div className="py-8 text-center text-sm text-red-600">{errorIncidentsData}</div>
            ) : incidentsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
                  <CheckCircle2 className="size-6" />
                </span>
                <p className="text-sm font-medium">All systems operational</p>
                <p className="text-xs text-muted-foreground mt-1">No incidents reported.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {incidentsData.slice(0, 5).map((entry) => {
                  const isOpen = !entry.resolvedAt;
                  const duration = formatDuration(entry.startedAt, entry.resolvedAt);
                  const relativeTime = formatRelativeTime(entry.startedAt);

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30 ${isOpen ? "border-red-500/30 bg-red-500/5" : "border-border"
                        }`}
                    >
                      {/* Status dot */}
                      <span className="relative mt-1.5 flex size-2 shrink-0">
                        {isOpen && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex size-2 rounded-full ${isOpen ? "bg-red-500" : "bg-emerald-500"
                            }`}
                        />
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{entry.service.name}</p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isOpen
                                ? "bg-red-500/15 text-red-600"
                                : "bg-emerald-500/15 text-emerald-600"
                              }`}
                          >
                            {isOpen ? "Open" : "Resolved"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {entry.reason || "No reason provided"}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Started {relativeTime}
                          </span>
                          {duration ? (
                            <span>Duration: {duration}</span>
                          ) : (
                            <span className="text-red-600 font-medium">Ongoing</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

  const chartConfig = {
    latencyMs: {
      label: "Latency",
    },
    up: {
      label: "Up",
      color: "hsl(142 76% 36%)",
    },
    down: {
      label: "Down",
      color: "hsl(0 84% 60%)",
    },
  } satisfies ChartConfig;

  // Ajoute la couleur sur chaque item selon son statut
  const chartData = items.map((item) => ({
    ...item,
    fill: item.status === "UP" ? "var(--color-up)" : "var(--color-down)",
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 24, top: 8, bottom: 8 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          dataKey="latencyMs"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}ms`}
          className="text-xs"
        />
        <YAxis
          type="category"
          dataKey="serviceName"
          tickLine={false}
          axisLine={false}
          width={120}
          className="text-xs"
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          content={
            <ChartTooltipContent
              formatter={(value) => `${value} ms`}
              hideLabel={false}
            />
          }
        />
        <Bar dataKey="latencyMs" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function ServiceHealthDonut({ upCount, downCount, timeoutCount }: { upCount: number; downCount: number; timeoutCount: number }) {
  const total = upCount + downCount + timeoutCount;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No service health data available yet.</p>;
  }

  const chartConfig = {
    up: {
      label: "Up",
      color: "hsl(142 76% 36%)",
    },
    down: {
      label: "Down",
      color: "hsl(0 84% 60%)",
    },
    timeout: {
      label: "Timeout",
      color: "hsl(38 92% 50%)",
    },
  } satisfies ChartConfig;

  // Filtre les statuts à 0 pour qu'ils n'apparaissent pas dans le donut
  const chartData = [
    { status: "up", count: upCount, fill: "var(--color-up)" },
    { status: "down", count: downCount, fill: "var(--color-down)" },
    { status: "timeout", count: timeoutCount, fill: "var(--color-timeout)" },
  ].filter((item) => item.count > 0);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={55}
          outerRadius={80}
          strokeWidth={4}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      Services
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

function IncidentsOverTimeChart({ incidents }: { incidents: incidentsResponse[] }) {
  // Groupe les incidents par jour sur les 14 derniers jours
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const chartData = last14Days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = incidents.filter((inc) => {
      const startedAt = new Date(inc.startedAt);
      return startedAt >= day && startedAt < nextDay;
    }).length;
    return {
      date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      incidents: count,
    };
  });

  const chartConfig = {
    incidents: { label: "Incidents", color: "hsl(0 84% 60%)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillIncidents" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-incidents)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-incidents)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} className="text-xs" width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="incidents"
          type="monotone"
          fill="url(#fillIncidents)"
          stroke="var(--color-incidents)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function UptimeRadialChart({ upCount, total }: { upCount: number; total: number }) {
  if (total === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;

  const percentage = Math.round((upCount / total) * 100);
  const chartData = [{ name: "uptime", value: percentage, fill: "var(--color-uptime)" }];

  const chartConfig = {
    uptime: { label: "Uptime", color: "hsl(142 76% 36%)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={90 - (percentage / 100) * 360}
        innerRadius={70}
        outerRadius={95}
      >
        <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[76, 64]} />
        <RadialBar dataKey="value" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                      {percentage}%
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                      Uptime
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}

function MTTRStat({ incidents }: { incidents: incidentsResponse[] }) {
  const resolvedIncidents = incidents.filter((inc) => inc.resolvedAt);

  if (resolvedIncidents.length === 0) {
    return <p className="text-sm text-muted-foreground">No resolved incidents yet.</p>;
  }

  const totalMs = resolvedIncidents.reduce((sum, inc) => {
    return sum + (new Date(inc.resolvedAt!).getTime() - new Date(inc.startedAt).getTime());
  }, 0);

  const avgMs = totalMs / resolvedIncidents.length;
  const avgMinutes = Math.floor(avgMs / 60000);
  const avgSeconds = Math.floor((avgMs % 60000) / 1000);

  const display = avgMinutes > 0 ? `${avgMinutes}m ${avgSeconds}s` : `${avgSeconds}s`;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <p className="text-4xl font-bold">{display}</p>
      <p className="text-xs text-muted-foreground mt-2">
        Average across {resolvedIncidents.length} resolved incident{resolvedIncidents.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}