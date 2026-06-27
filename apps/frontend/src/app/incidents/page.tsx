"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TableFetchError } from "@/components/ui/fetch-error/table-fetch-error";
import { api, incidentsResponse } from "@/lib/api";
import { formatDuration } from "@/lib/duration";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    Inbox,
    ListChecks,
    Pencil,
    RefreshCw,
    Search,
    Server,
    Timer,
    Wrench,
    X,
    type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StatusFilter = "all" | "open" | "resolved";

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

function relativeTime(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<incidentsResponse[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<incidentsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const fetchAllIncidents = () => {
        setLoading(true);
        api.incidents.getAll()
            .then((data) => {
                setIncidents(data);
                setError(null);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAllIncidents();
    }, []);

    const openCount = useMemo(() => incidents.filter((i) => !i.resolvedAt).length, [incidents]);
    const resolvedCount = incidents.length - openCount;

    const filteredIncidents = useMemo(() => {
        const q = query.trim().toLowerCase();
        return incidents.filter((incident) => {
            const isOpen = !incident.resolvedAt;
            if (statusFilter === "open" && !isOpen) return false;
            if (statusFilter === "resolved" && isOpen) return false;
            if (!q) return true;
            return (
                incident.service.name.toLowerCase().includes(q) ||
                (incident.reason ?? "").toLowerCase().includes(q)
            );
        });
    }, [incidents, statusFilter, query]);

    const hasPanel = Boolean(selectedIncident);

    const handleIncidentUpdated = (updated: incidentsResponse) => {
        setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        setSelectedIncident((current) =>
            current && current.id === updated.id ? updated : current
        );
    };

    return (
        <div className="flex h-[calc(100vh-40px)]">
            <div className={`flex min-w-0 flex-col transition-all duration-300 ${hasPanel ? "w-2/5" : "w-full"}`}>
                {/* Header */}
                <div className="space-y-4 p-6 pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <AlertTriangle className="size-5" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
                                <p className="text-sm text-muted-foreground">
                                    Track and investigate service disruptions.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchAllIncidents}
                            disabled={loading}
                            className="cursor-pointer"
                        >
                            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Summary pills */}
                    <div className="grid grid-cols-3 gap-3">
                        <StatPill label="Total" value={incidents.length} icon={ListChecks} accent="default" />
                        <StatPill label="Open" value={openCount} icon={AlertCircle} accent="danger" />
                        <StatPill label="Resolved" value={resolvedCount} icon={CheckCircle2} accent="success" />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by service or reason..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-1">
                            {(["all", "open", "resolved"] as StatusFilter[]).map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setStatusFilter(value)}
                                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto px-6 pb-6">
                    {error ? (
                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full text-sm">
                                <tbody>
                                    <TableFetchError colSpan={6} message={error} onRetry={fetchAllIncidents} />
                                </tbody>
                            </table>
                        </div>
                    ) : loading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : filteredIncidents.length === 0 ? (
                        <EmptyState filtered={Boolean(query) || statusFilter !== "all"} />
                    ) : hasPanel ? (
                        <div className="space-y-2">
                            {filteredIncidents.map((incident) => (
                                <IncidentCard
                                    key={incident.id}
                                    incident={incident}
                                    selected={selectedIncident?.id === incident.id}
                                    onSelect={() =>
                                        setSelectedIncident(
                                            selectedIncident?.id === incident.id ? null : incident
                                        )
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr className="text-muted-foreground">
                                        <th className="p-3 text-left font-medium">Service</th>
                                        <th className="p-3 text-left font-medium">Status</th>
                                        <th className="p-3 text-left font-medium">Reason</th>
                                        <th className="p-3 text-left font-medium">Started</th>
                                        <th className="p-3 text-left font-medium">Resolved</th>
                                        <th className="p-3 text-left font-medium">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIncidents.map((incident) => {
                                        const isOpen = !incident.resolvedAt;
                                        return (
                                            <tr
                                                key={incident.id}
                                                onClick={() => setSelectedIncident(incident)}
                                                className="group cursor-pointer border-t transition-colors hover:bg-muted/40"
                                            >
                                                <td className="p-3 font-medium">{incident.service.name}</td>
                                                <td className="p-3"><IncidentStatusBadge isOpen={isOpen} /></td>
                                                <td className="max-w-xs truncate p-3 text-muted-foreground">
                                                    {incident.reason || "—"}
                                                </td>
                                                <td className="whitespace-nowrap p-3 text-muted-foreground">
                                                    {formatDateTime(incident.startedAt)}
                                                </td>
                                                <td className="whitespace-nowrap p-3 text-muted-foreground">
                                                    {incident.resolvedAt ? formatDateTime(incident.resolvedAt) : "—"}
                                                </td>
                                                <td className="whitespace-nowrap p-3">
                                                    {formatDuration(incident.startedAt, incident.resolvedAt) ?? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                                                            Ongoing
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedIncident && (
                <div className="w-3/5 overflow-auto border-l p-6 duration-300 animate-in fade-in-0 slide-in-from-right-4">
                    <IncidentDetailPanel
                        incident={selectedIncident}
                        onClose={() => setSelectedIncident(null)}
                        onUpdated={handleIncidentUpdated}
                    />
                </div>
            )}
        </div>
    );
}

function IncidentDetailPanel({
    incident,
    onClose,
    onUpdated,
}: {
    incident: incidentsResponse;
    onClose: () => void;
    onUpdated: (incident: incidentsResponse) => void;
}) {
    const isOpen = !incident.resolvedAt;
    const startedAt = formatDateTime(incident.startedAt);
    const resolvedAt = incident.resolvedAt ? formatDateTime(incident.resolvedAt) : "—";
    const duration = formatDuration(incident.startedAt, incident.resolvedAt) ?? "Ongoing";

    const [editRootCause, setEditRootCause] = useState(false);
    const [rootCause, setRootCause] = useState(incident.reason ?? "");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Reset local state when switching to a different incident.
    useEffect(() => {
        setRootCause(incident.reason ?? "");
        setEditRootCause(false);
        setSaveError(null);
    }, [incident.id, incident.reason]);

    function handleSaveRootCause() {
        setSaving(true);
        setSaveError(null);
        api.incidents.resolve(incident.id, rootCause)
            .then((updated) => {
                // Merge the server response onto the current incident so nested
                // fields (e.g. `service`) are preserved even if the API omits them.
                const partial = (updated && typeof updated === "object"
                    ? updated
                    : {}) as Partial<incidentsResponse>;
                const next: incidentsResponse = {
                    ...incident,
                    ...partial,
                    service: partial.service ?? incident.service,
                    reason: partial.reason ?? rootCause,
                };
                onUpdated(next);
                setEditRootCause(false);
            })
            .catch((error) => {
                setSaveError(error instanceof Error ? error.message : "Failed to save root cause");
            })
            .finally(() => setSaving(false));
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className={`flex size-9 items-center justify-center rounded-xl ${isOpen
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}>
                            {isOpen ? <AlertCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
                        </span>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">{incident.service.name}</h2>
                            <p className="font-mono text-xs text-muted-foreground">#{incident.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <IncidentStatusBadge isOpen={isOpen} />
                </div>
                <button
                    onClick={onClose}
                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close incident details"
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Meta grid */}
            <div className="mb-6 grid grid-cols-2 gap-3">
                <InfoItem icon={Server} label="Service" value={incident.service.name} />
                <InfoItem icon={Timer} label="Duration" value={duration} />
                <InfoItem icon={Clock} label="Started" value={startedAt} />
                <InfoItem icon={CheckCircle2} label="Resolved" value={resolvedAt} />
            </div>

            {/* Summary callout */}
            <div className={`mb-6 rounded-lg border p-4 ${isOpen
                ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                }`}>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <FileText className="size-3.5" /> Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                    This incident {isOpen ? "is still ongoing" : "has been resolved"}.{" "}
                    {isOpen
                        ? "Review the service and recent checks to identify the cause."
                        : "Review check history to confirm service stability."}
                </p>
            </div>

            {/* Recommended actions */}
            <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ListChecks className="size-3.5" /> Recommended Actions
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {(isOpen
                        ? [
                            "Review service logs to identify recent errors.",
                            "Inspect monitoring checks to detect failure patterns.",
                            "Contact the owning team for deeper investigation.",
                        ]
                        : [
                            "Confirm the service is stable and checks are passing.",
                            "Document the incident cause and remediation actions.",
                            "Consider improvements to prevent similar incidents.",
                        ]
                    ).map((action) => (
                        <li key={action} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" />
                            <span>{action}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Root cause */}
            <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Wrench className="size-3.5" /> Root Cause (Reported)
                    </h3>
                    {!editRootCause && (
                        <button onClick={() => setEditRootCause(true)} className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"   >
                            <Pencil className="size-3" /> Edit
                        </button>
                    )}
                </div>
                {editRootCause ? (
                    <>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveRootCause();
                            }}
                            className="space-y-2"
                        >
                            <textarea
                                className="w-full resize-none rounded-lg border bg-transparent p-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                value={rootCause}
                                onChange={(e) => setRootCause(e.target.value)}
                                rows={4}
                                placeholder="Describe the root cause of this incident..."
                            />
                            <div className="flex items-center gap-2">
                                <Button type="submit" size="sm" className="cursor-pointer" disabled={saving}>
                                    {saving ? "Saving…" : "Save"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    disabled={saving}
                                    onClick={() => {
                                        setRootCause(incident.reason ?? "");
                                        setSaveError(null);
                                        setEditRootCause(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                            {saveError && (
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                    {saveError}
                                </p>
                            )}
                        </form>
                    </>
                ) : (
                    <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                        {rootCause || "No reason was provided for this incident."}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto flex gap-2 border-t pt-4">
                <Button variant="outline" size="sm" className="cursor-pointer" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}

function StatPill({
    label,
    value,
    icon: Icon,
    accent,
}: {
    label: string;
    value: number;
    icon: LucideIcon;
    accent: "default" | "danger" | "success";
}) {
    const valueColor = {
        default: "text-foreground",
        danger: "text-red-600 dark:text-red-400",
        success: "text-emerald-600 dark:text-emerald-400",
    }[accent];
    const iconColor = {
        default: "bg-primary/10 text-primary",
        danger: "bg-red-500/10 text-red-600 dark:text-red-400",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    }[accent];

    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <span className={`flex size-9 items-center justify-center rounded-lg ${iconColor}`}>
                <Icon className="size-4" />
            </span>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold tabular-nums ${valueColor}`}>{value}</p>
            </div>
        </div>
    );
}

function IncidentStatusBadge({ isOpen }: { isOpen: boolean }) {
    return (
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isOpen
            ? "bg-red-500/15 text-red-600 dark:text-red-400"
            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "animate-pulse bg-red-500" : "bg-emerald-500"}`} />
            {isOpen ? "Open" : "Resolved"}
        </span>
    );
}

function IncidentCard({
    incident,
    selected,
    onSelect,
}: {
    incident: incidentsResponse;
    selected: boolean;
    onSelect: () => void;
}) {
    const isOpen = !incident.resolvedAt;
    return (
        <button
            onClick={onSelect}
            className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${selected ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"
                }`}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{incident.service.name}</span>
                <IncidentStatusBadge isOpen={isOpen} />
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
                {incident.reason || "No reason provided"}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {relativeTime(incident.startedAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                    <Timer className="size-3" />
                    {formatDuration(incident.startedAt, incident.resolvedAt) ?? "Ongoing"}
                </span>
            </div>
        </button>
    );
}

function EmptyState({ filtered }: { filtered: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Inbox className="size-6" />
            </span>
            <p className="mt-3 text-sm font-medium">No incidents found</p>
            <p className="mt-1 text-xs text-muted-foreground">
                {filtered ? "Try adjusting your search or filters." : "All your services are healthy."}
            </p>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
    return (
        <div className="rounded-lg border bg-card p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                {Icon && <Icon className="size-3.5" />}
                {label}
            </p>
            <p className="break-words text-sm font-medium">{value}</p>
        </div>
    );
}