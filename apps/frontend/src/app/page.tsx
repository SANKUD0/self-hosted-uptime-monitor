"use client";

import { StatCard } from "@/components/StatCard";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className={`m-10`}>
      <div className="grid grid-cols-4 gap-5 mb-4  text-center">
        <StatCard title="Registered Services" value={count} error={errorCount} />
        <StatCard title="Services UP" value={up} error={errorUp} />
        <StatCard title="Services DOWN" value={down} error={errorDown} />
        <StatCard title="Incidents OPEN" value={incidents} error={errorIncidents} />
      </div>
      <div className={`w-full ${errorMonitoring ? "p-4" : ""}`}>
        {errorMonitoring ? (
          <p className="text-sm text-destructive text-center">{errorMonitoring}</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Services monitoring</CardTitle>
              <CardDescription>Latest updates for all services</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Service Name</th>
                    <th className="border px-4 py-2">Type</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Status Code</th>
                    <th className="border px-4 py-2">Error</th>
                    <th className="border px-4 py-2">Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoringData.map((entry) => (
                    <tr key={entry.id}>
                      <td className="border px-4 py-2">{entry.service.name}</td>
                      <td className="border px-4 py-2">{entry.service.type}</td>
                      <td className={`border px-4 py-2 font-bold ${entry.status === "UP" ? "text-green-500" : "text-red-500"}`}>
                        {entry.status}
                      </td>
                      <td className="border px-4 py-2">{entry.statusCode !== null ? <div>HTTP {entry.statusCode}</div> : "N/A"}</td>
                      <td className="border px-4 py-2">
                        {entry.error
                          ? <span className="text-yellow-500 font-medium">{entry.error}</span>
                          : <span className="text-green-500">✓</span>
                        }
                      </td>
                      <td className="border px-4 py-2">{new Date(entry.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
