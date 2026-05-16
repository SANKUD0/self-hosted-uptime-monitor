"use client";

import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, incidentsResponse, servicesMonitoringResponse } from "@/lib/api";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

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

  const fetchServicesData = async () => {
    api.services.getCount()
      .then((data) => setCount(data.count))
      .catch((err) => setErrorCount(err.message))

    api.services.getCountUp()
      .then((data) => setUp(data.upServices))
      .catch((err) => setErrorUp(err.message))

    api.services.getCountDown()
      .then((data) => setDown(data.downServices))
      .catch((err) => setErrorDown(err.message))

  };
  const fetchIncidentsData = async () => {
    api.incidents.getAll()
      .then((data) => setIncidentsData(data))
      .catch((err) => setErrorIncidentsData(err.message));
    api.incidents.getCount()
      .then((data) => setIncidents(data.count))
      .catch((err) => setErrorIncidents(err.message))
  }
  const fetchMonitoringData = async () => {
    api.monitoring.getAll()
      .then((data) => setMonitoringData(data))
      .catch((err) => setErrorMonitoring(err.message));
  }

  useEffect(() => {
    // fetch all stats on component mount
    fetchServicesData();
    fetchIncidentsData();
    fetchMonitoringData();

    // TODO: Dans le futurs, on pourrait utiliser WebSocket pour éviter de faire du polling
    // TODO: Dans le futurs, l'utilisateur pourrait configurer la fréquence de rafraîchissement des données

    const interval = setInterval(fetchServicesData, 30000); // 30 secondes
    const intervalIncidents = setInterval(fetchIncidentsData, 30000); // 30 seconds
    const intervalMonitoring = setInterval(fetchMonitoringData, 30000); // 30 seconds

    return () => {
      // cleanup all intervals on component unmount
      clearInterval(interval);
      clearInterval(intervalIncidents);
      clearInterval(intervalMonitoring);
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
    <div className="m-10">
      <div className="grid grid-cols-4 gap-5 mb-6 text-center">
        <StatCard title="Registered Services" value={count} error={errorCount} />
        <StatCard title="Services UP" value={up} error={errorUp} />
        <StatCard title="Services DOWN" value={down} error={errorDown} />
        <StatCard title="Incidents OPEN" value={incidents} error={errorIncidents} />
      </div>
      <div className="w-full">
        {errorMonitoring ? (
          <p className="text-sm text-destructive text-center p-4">{errorMonitoring}</p>
        ) : (
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
                    <TableHead>Status</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>HTTP Code</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="w-full pt-6">
        {errorIncidentsData ? (
          <p className="text-sm text-destructive text-center p-4">{errorIncidentsData}</p>
        ) : (
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
