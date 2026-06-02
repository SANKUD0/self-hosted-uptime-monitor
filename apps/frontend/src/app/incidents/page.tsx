"use client";
import { Button } from "@/components/ui/button";
import { TableFetchError } from "@/components/ui/fetch-error/table-fetch-error";
import { api, incidentsResponse } from "@/lib/api";
import { formatDuration } from "@/lib/duration";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<incidentsResponse[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<incidentsResponse | null>(null);
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
            <div className={`flex flex-col transition-all duration-300 ${selectedIncident ? "w-2/5" : "w-full"}`}>
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
                                            const isSelected = selectedIncident?.id === incident.id;
                                            return (
                                                <tr key={incident.id} className={`border-t cursor-pointer transition-colors ${isSelected
                                                    ? "bg-primary/5 border-l-2 border-l-primary"
                                                    : isOpen
                                                        ? "hover:bg-red-50"
                                                        : "hover:bg-green-50"
                                                    }`}
                                                    onClick={() => setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)}>
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
            {selectedIncident && (
                <div className="w-3/5 border-l p-6 overflow-auto">
                    <IncidentDetailPanel incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
                </div>
            )}
        </div>
    );
}

function IncidentDetailPanel({ incident, onClose }: { incident: incidentsResponse; onClose: () => void }) {
    const isOpen = !incident.resolvedAt;
    const startedAt = new Date(incident.startedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" });
    const resolvedAt = incident.resolvedAt
        ? new Date(incident.resolvedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" })
        : "—";

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Incident #{incident.id.slice(0, 8)}</h2>
                    </div>
                    <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isOpen
                            ? "bg-red-500/15 text-red-600"
                            : "bg-green-500/15 text-green-600"
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-red-500" : "bg-green-500"}`} />
                            {isOpen ? "Open" : "Resolved"}
                        </span>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors" aria-label="Close incident details">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoItem label="Service" value={incident.service.name} />
                <InfoItem label="Started" value={startedAt} />
                <InfoItem label="Resolved" value={resolvedAt} />
                <InfoItem label="Duration" value={formatDuration(incident.startedAt, incident.resolvedAt) ?? "Ongoing"} />
                <div className="col-span-2">
                    <InfoItem label="Reason" value={incident.reason} />
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                    Cet incident {isOpen ? "est toujours en cours" : "a ete resolu"}. {isOpen
                        ? "Verifier le service et les checks recents pour identifier la cause."
                        : "Pensez a verifier l'historique des checks pour confirmer la stabilite."}
                </p>
            </div>

            <div className="mt-auto flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="cursor-pointer" onClick={onClose}>
                    Fermer
                </Button>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}