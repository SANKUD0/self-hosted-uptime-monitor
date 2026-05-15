"use client";

import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, servicesMonitoringResponse } from "@/lib/api";
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

  useEffect(() => {
    // fetch les stats à tous les 30 secondes
    const fetchData = async () => {
      api.services.getCount()
        .then((data) => setCount(data.count))
        .catch((err) => setErrorCount(err.message))

      api.services.getCountUp()
        .then((data) => setUp(data.UpServices))
        .catch((err) => setErrorUp(err.message))

      api.services.getCountDown()
        .then((data) => setDown(data.DownServices))
        .catch((err) => setErrorDown(err.message))

      api.incidents.getCount()
        .then((data) => setIncidents(data.count))
        .catch((err) => setErrorIncidents(err.message))
      api.monitoring.getAll()
        .then((data) => setMonitoringData(data))
        .catch((err) => setErrorMonitoring(err.message));
    };
    fetchData();
    // TODO: Dans le futurs, on pourrait utiliser WebSocket pour éviter de faire du polling
    // TODO: Dans le futurs, l'utilisateur pourrait configurer la fréquence de rafraîchissement des données
    const interval = setInterval(fetchData, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, []);

  const sortedMonitoring = [...monitoringData].sort((a, b) => {
    if (a.status === "DOWN" && b.status !== "DOWN") return -1;
    if (a.status !== "DOWN" && b.status === "DOWN") return 1;
    return a.service.name.localeCompare(b.service.name);
  });

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
                  {sortedMonitoring.map((entry) => (
                    <TableRow key={entry.id} className={entry.status === "DOWN" ? "bg-red-500/5" : ""}>
                      <TableCell className="font-medium">{entry.service.name}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.service.type}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{entry.service.target}</TableCell>
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
                        {entry.statusCode !== null ? `HTTP ${entry.statusCode}` : "—"}
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
      <div className={`w-full pt-6`}>
        <Card>
          <CardHeader>
            <CardTitle>Recents Incidents</CardTitle>
            <CardDescription>Latest incidents — refreshed every 30s</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMonitoring.map((entry) => (
                  <TableRow key={entry.id} className={entry.status === "DOWN" ? "bg-red-500/5" : ""}>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
