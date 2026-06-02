"use client";
import { TableFetchError } from "@/components/ui/fetch-error/table-fetch-error";
import { api, incidentsResponse } from "@/lib/api";
import { formatDuration } from "@/lib/duration";
import { useEffect, useState } from "react";

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<incidentsResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchAllIncidents = () => {
        api.incidents.getAll()
            .then(setIncidents)
            .catch((err) => setError(err.message));
    }

    useEffect(() => {
        fetchAllIncidents();
    }, []);

    return (
        <div className="flex h-[calc(100vh-40px)]">
            <div className={`flex flex-col transition-all duration-300`}>
                <div className="p-6 pb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Incidents</h1>
                </div>
                <div className="px-6 pb-6 overflow-auto">
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-3 font-medium">Service</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Reason</th>
                                    <th className="text-left p-3 font-medium">Started</th>
                                    <th className="text-left p-3 font-medium">Resolved</th>
                                    <th className="text-left p-3 font-medium">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {error ? (
                                    <TableFetchError colSpan={6} message={error} />
                                ) : (
                                    <>
                                        {incidents.map((incident) => {
                                            const isOpen = !incident.resolvedAt;
                                            return (
                                                <tr key={incident.id}>
                                                    <td className="p-3">{incident.service.name}</td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isOpen
                                                            ? "bg-red-500/15 text-red-600"
                                                            : "bg-green-500/15 text-green-600"
                                                            }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-red-500" : "bg-green-500"}`} />
                                                            {isOpen ? "Open" : "Resolved"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{incident.reason}</td>
                                                    <td className="p-3">{new Date(incident.startedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" })}</td>
                                                    <td className="p-3">{incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" }) : "—"}</td>
                                                    <td className="p-3">{formatDuration(incident.startedAt, incident.resolvedAt) ?? <span className="text-red-500 text-xs font-medium">Ongoing</span>}</td>
                                                </tr>
                                            );
                                        })}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}