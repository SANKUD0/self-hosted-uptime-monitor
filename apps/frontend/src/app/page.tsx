"use client";

import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TableFetchError } from "@/components/ui/fetch-error/table-fetch-error";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealtimeSocket } from "@/hooks/useRealTimeSocket";
import { api, incidentsResponse, servicesMonitoringResponse } from "@/lib/api";
import { REALTIME_EVENTS } from "@/lib/realtime-events";
import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Inbox,
  RefreshCw,
  Server,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";

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
    void refreshDashboardHttpData();
  }, []);

  useRealtimeSocket({
    [REALTIME_EVENTS.MONITORING_UPDATED]: (payload) => {
      const data = payload as servicesMonitoringResponse;
      setMonitoringData((prev) => prev.map((entry) => (entry.id === data.id ? data : entry)));
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
      setIncidentsData((prev) => {
        const exists = prev.find((e) => e.id === data.id);
        if (exists) return prev.map((e) => (e.id === data.id ? data : e));
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
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time overview of your monitored services and incidents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-card">
              <span className="relative flex size-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    hasGlobalError ? "bg-red-500" : "animate-ping bg-emerald-500"
                  }`}
                />
                <span
                  className={`relative inline-flex size-2 rounded-full ${
                    hasGlobalError ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {hasGlobalError
                  ? "Connection issue"
                  : lastUpdated
                    ? `Live · Updated ${lastUpdated.toLocaleTimeString()}`
                    : "Connecting…"}
              </span>
            </Badge>

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

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="flex items-center gap-2">MTTR</CardDescription>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <MTTRStat incidents={incidentsData} />
            </CardContent>
          </Card>
        </div>

        {/* Charts row 1 — Latency + Health Split */}
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

        {/* Charts row 2 — Incidents Over Time + Uptime */}
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

        {/* Services Monitoring */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Services Monitoring</CardTitle>
            <CardDescription>Latest status for all services — live via WebSocket</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead className="pr-6">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorMonitoring ? (
                  <TableFetchError colSpan={8} message={errorMonitoring} />
                ) : monitoringData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12">
                      <EmptyState
                        icon={Inbox}
                        title="No services monitored"
                        description="Services you add will appear here once monitoring starts."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  monitoringData.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={entry.status === "DOWN" ? "bg-red-500/5" : ""}
                    >
                      <TableCell className="pl-6 font-medium">{entry.service.name}</TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {entry.service.type}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-[280px]">
                        {entry.service.target.startsWith("http") ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={entry.service.target}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors max-w-full"
                              >
                                <span className="truncate">{entry.service.target}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>{entry.service.target}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">
                            {entry.service.target}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        {entry.service.enabled ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                          >
                            <Check className="size-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            <X className="size-3 mr-1" />
                            Disabled
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={entry.status} />
                      </TableCell>

                      <TableCell>
                        {entry.latencyMs !== null ? (
                          <span
                            className={`font-mono text-xs ${
                              entry.latencyMs > 1000 ? "text-amber-600 font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            {entry.latencyMs} ms
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {entry.statusCode !== null ? (
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs ${
                              entry.statusCode >= 200 && entry.statusCode < 300
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                                : "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400"
                            }`}
                          >
                            {entry.statusCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="pr-6">
                        {entry.error ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-amber-600 truncate max-w-[200px] inline-block cursor-help">
                                {entry.error}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">{entry.error}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Check className="size-4 text-emerald-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
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
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30 ${
                        isOpen ? "border-red-500/30 bg-red-500/5" : "border-border"
                      }`}
                    >
                      <span className="relative mt-1.5 flex size-2 shrink-0">
                        {isOpen && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex size-2 rounded-full ${
                            isOpen ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{entry.service.name}</p>
                          <Badge
                            variant="outline"
                            className={
                              isOpen
                                ? "bg-red-500/15 text-red-600 border-red-500/30 text-[10px] uppercase tracking-wide"
                                : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] uppercase tracking-wide"
                            }
                          >
                            {isOpen ? "Open" : "Resolved"}
                          </Badge>
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

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { style: string; dot: string; pulse: boolean }> = {
    UP: {
      style: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
      dot: "bg-emerald-500",
      pulse: true,
    },
    DOWN: {
      style: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400",
      dot: "bg-red-500",
      pulse: false,
    },
    TIMEOUT: {
      style: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400",
      dot: "bg-amber-500",
      pulse: false,
    },
  };
  const c = config[status] || config.DOWN;

  return (
    <Badge variant="outline" className={c.style}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${c.dot} ${c.pulse ? "animate-pulse" : ""}`} />
      {status}
    </Badge>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] gap-2">
      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
        <Activity className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

function LatencyBarChart({
  items,
}: {
  items: Array<{ id: string; serviceName: string; latencyMs: number; status: string }>;
}) {
  if (items.length === 0) {
    return <EmptyChartState message="No latency data available yet." />;
  }

  const chartConfig = {
    latencyMs: { label: "Latency" },
    up: { label: "Up", color: "hsl(142 76% 36%)" },
    down: { label: "Down", color: "hsl(0 84% 60%)" },
  } satisfies ChartConfig;

  const chartData = items.map((item) => ({
    ...item,
    fill: item.status === "UP" ? "var(--color-up)" : "var(--color-down)",
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
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
          content={<ChartTooltipContent formatter={(value) => `${value} ms`} hideLabel={false} />}
        />
        <Bar dataKey="latencyMs" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function ServiceHealthDonut({
  upCount,
  downCount,
  timeoutCount,
}: {
  upCount: number;
  downCount: number;
  timeoutCount: number;
}) {
  const total = upCount + downCount + timeoutCount;

  if (total === 0) {
    return <EmptyChartState message="No service health data available yet." />;
  }

  const chartConfig = {
    up: { label: "Up", color: "hsl(142 76% 36%)" },
    down: { label: "Down", color: "hsl(0 84% 60%)" },
    timeout: { label: "Timeout", color: "hsl(38 92% 50%)" },
  } satisfies ChartConfig;

  const chartData = [
    { status: "up", count: upCount, fill: "var(--color-up)" },
    { status: "down", count: downCount, fill: "var(--color-down)" },
    { status: "timeout", count: timeoutCount, fill: "var(--color-timeout)" },
  ].filter((item) => item.count > 0);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={55} outerRadius={80} strokeWidth={4}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                      {total}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
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

  const hasAnyIncidents = chartData.some((d) => d.incidents > 0);
  if (!hasAnyIncidents) {
    return <EmptyChartState message="No incidents in the last 14 days." />;
  }

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
  if (total === 0) return <EmptyChartState message="No data yet." />;

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
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[76, 64]}
        />
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
    return (
      <div>
        <p className="text-2xl font-bold text-muted-foreground">—</p>
        <p className="text-xs text-muted-foreground mt-1">No data yet</p>
      </div>
    );
  }

  const totalMs = resolvedIncidents.reduce((sum, inc) => {
    return sum + (new Date(inc.resolvedAt!).getTime() - new Date(inc.startedAt).getTime());
  }, 0);

  const avgMs = totalMs / resolvedIncidents.length;
  const avgMinutes = Math.floor(avgMs / 60000);
  const avgSeconds = Math.floor((avgMs % 60000) / 1000);

  return (
    <div>
      <p className="text-2xl font-bold">
        {avgMinutes > 0 ? `${avgMinutes}m ${avgSeconds}s` : `${avgSeconds}s`}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {resolvedIncidents.length} resolved
      </p>
    </div>
  );
}