"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TableFetchError } from "@/components/ui/fetch-error/table-fetch-error";
import StatusBadge, { StatusBadgeEnabled } from "@/components/status";

import {
    api, CreateServiceRequest, MonotoringChecksResponse,
    ServicesCardInfo, ServiceType, serviceTypeSelect,
} from "@/lib/api";
import { msToSeconds } from "@/lib/duration";

const EMPTY_SERVICE: CreateServiceRequest = {
    name: "", type: "PING", target: "",
    intervalSeconds: 60, timeoutMs: 5000, failureThreshold: 3, enabled: true,
};

const formatLatency = (ms?: number | null) =>
    ms == null ? "—" : ms >= 1000 ? `${msToSeconds(ms).toFixed(2)}s` : `${ms}ms`;

type ServicePatch = Partial<ServicesCardInfo["service"]>;



export default function ServicesPage() {
    const isMobile = useIsMobile();

    const [services, setServices] = useState<ServicesCardInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    const [openId, setOpenId] = useState<string | null>(null);

    const selected = services.find((s) => s.service.id === openId) ?? null;

    const fetchServices = () =>
        api.services.getServicesCardsInfos()
            .then(setServices)
            .catch((e) => setError(e.message));

    useEffect(() => { fetchServices(); }, []);

    const patchService = (id: string, patch: ServicePatch) =>
        setServices((list) =>
            list.map((item) =>
                item.service.id === id
                    ? { ...item, service: { ...item.service, ...patch } }
                    : item
            )
        );

    const close = () => setOpenId(null);

    // Mobile  : chevron | Nom | Statut
    // Desktop : Nom | Statut | Activé
    const COLS = 3;

    return (
        <div className="flex h-full">

            {/* ---------- LISTE ---------- */}
            <section className="flex min-w-0 flex-1 flex-col overflow-hidden">

                <header className="flex shrink-0 items-center justify-between gap-3 p-4 sm:p-6">
                    <h1 className="text-xl font-bold sm:text-2xl">
                        Services
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({services.length})
                        </span>
                    </h1>

                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="shrink-0 whitespace-nowrap">
                                <Plus className="size-4" />
                                <span className="hidden sm:inline">Ajouter un service</span>
                            </Button>
                        </DialogTrigger>
                        <AddServiceDialog
                            onCreated={() => { fetchServices(); setAddOpen(false); }}
                            onError={setError}
                        />
                    </Dialog>
                </header>

                <div className="flex-1 overflow-auto px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {isMobile && <TableHead className="w-10" />}
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Statut</TableHead>
                                    {!isMobile && <TableHead>Activé</TableHead>}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {error ? (
                                    <TableFetchError colSpan={COLS} message={error} onRetry={fetchServices} />
                                ) : services.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={COLS} className="h-24 text-center text-muted-foreground">
                                            Aucun service pour l’instant. Ajoutez-en un.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    services.map((s) => {
                                        const isOpen = openId === s.service.id;
                                        return (
                                            <Fragment key={s.service.id}>

                                                <TableRow
                                                    onClick={() => setOpenId(isOpen ? null : s.service.id)}
                                                    aria-expanded={isMobile ? isOpen : undefined}
                                                    className={cn(
                                                        "cursor-pointer",
                                                        // Desktop
                                                        isOpen && !isMobile && "border-l-2 border-l-primary bg-primary/5",
                                                        // Mobile 
                                                        isOpen && isMobile && "bg-muted/40"
                                                    )}
                                                >
                                                    {isMobile && (
                                                        <TableCell>
                                                            <ChevronRight
                                                                className={cn(
                                                                    "size-4 text-muted-foreground transition-transform duration-200",
                                                                    isOpen && "rotate-90"
                                                                )}
                                                            />
                                                        </TableCell>
                                                    )}

                                                    <TableCell className="font-medium">
                                                        {s.service.name}
                                                        {/* Mobile */}
                                                        {isMobile && !s.service.enabled && (
                                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                                en pause
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell><StatusBadge status={s.status} /></TableCell>

                                                    {!isMobile && (
                                                        <TableCell>
                                                            <StatusBadgeEnabled enabled={s.service.enabled} />
                                                        </TableCell>
                                                    )}
                                                </TableRow>

                                                {/* Mobile */}
                                                {isMobile && isOpen && (
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableCell
                                                            colSpan={COLS}
                                                            className="border-l-2 border-l-primary bg-muted/20 p-0"
                                                        >
                                                            <ServiceDetail
                                                                key={s.service.id}
                                                                service={s}
                                                                variant="inline"
                                                                onClose={close}
                                                                onRefresh={fetchServices}
                                                                onPatch={patchService}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </section>

            {/* Desktop */}
            {!isMobile && selected && (
                <aside className="w-[420px] shrink-0 overflow-y-auto border-l">
                    <ServiceDetail
                        key={selected.service.id}
                        service={selected}
                        variant="panel"
                        onClose={close}
                        onRefresh={fetchServices}
                        onPatch={patchService}
                    />
                </aside>
            )}
        </div>
    );
}

function ServiceDetail({
    service, variant, onClose, onRefresh, onPatch,
}: {
    service: ServicesCardInfo;
    variant: "panel" | "inline";
    onClose: () => void;
    onRefresh: () => void;
    onPatch: (id: string, patch: ServicePatch) => void;
}) {
    const s = service.service;
    const isPanel = variant === "panel";

    const [editing, setEditing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [target, setTarget] = useState("");
    const [checks, setChecks] = useState<MonotoringChecksResponse[]>([]);
    const [checksError, setChecksError] = useState<string | null>(null);
    const [form, setForm] = useState({ ...s, target: "" });

    const loadChecks = () =>
        api.monitoring.get5FirstRecentChecksForService({ id: s.id })
            .then(setChecks)
            .catch((e) => setChecksError(e.message));

    useEffect(() => {
        api.services.getService(s.id).then((data) => {
            const t = data?.target ?? "";
            setTarget(t);
            setForm({ ...s, target: t });
        });
        loadChecks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [s.id]);

    const toggle = async (next: boolean) => {
        onPatch(s.id, { enabled: next });      
        try {
            await api.services.enableDisableService(s.id, next);
        } catch {
            onPatch(s.id, { enabled: !next });    
        }
    };

    const save = async () => {
        await api.services.patch(s.id, form);
        onPatch(s.id, form);
        setTarget(form.target);
        setEditing(false);
        onRefresh();
    };

    const remove = async () => {
        await api.services.delete(s.id);
        setConfirmOpen(false);
        onRefresh();
        onClose();
    };

    return (

        <div
            className={cn("@container flex flex-col gap-5 p-4 sm:p-6", isPanel && "h-full")}
            onClick={(e) => e.stopPropagation()}
        >
            {isPanel ? (
                <header className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <h2 className="truncate text-xl font-bold">{s.name}</h2>
                            <Switch checked={s.enabled} onCheckedChange={toggle}
                                aria-label="Activer le service" className="shrink-0" />
                        </div>
                        <div className="mt-1"><StatusBadge status={service.status} /></div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}
                        aria-label="Fermer le panneau" className="shrink-0">
                        <X className="size-4" />
                    </Button>
                </header>
            ) : (

                <div className="flex items-center gap-3">
                    <Switch checked={s.enabled} onCheckedChange={toggle}
                        aria-label="Activer le service" />
                    <Label className="text-muted-foreground">
                        {s.enabled ? "Surveillance active" : "Surveillance en pause"}
                    </Label>
                </div>
            )}

   
            <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-4">
                {editing ? (
                    <>
                        <Field>
                            <FieldLabel htmlFor={`name-${s.id}`}>Nom</FieldLabel>
                            <Input id={`name-${s.id}`} value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`type-${s.id}`}>Type</FieldLabel>
                            <Select value={form.type}
                                onValueChange={(v) => setForm({ ...form, type: v as ServiceType })}>
                                <SelectTrigger id={`type-${s.id}`} className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {serviceTypeSelect.map((i) => (
                                        <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field className="@lg:col-span-2">
                            <FieldLabel htmlFor={`target-${s.id}`}>Cible</FieldLabel>
                            <Input id={`target-${s.id}`} value={form.target}
                                onChange={(e) => setForm({ ...form, target: e.target.value })} />
                        </Field>
                        <NumberField id={`interval-${s.id}`} label="Intervalle (s)"
                            value={form.intervalSeconds}
                            onValue={(v) => setForm({ ...form, intervalSeconds: v })} />
                        <NumberField id={`timeout-${s.id}`} label="Timeout (ms)"
                            value={form.timeoutMs ?? 5000}
                            onValue={(v) => setForm({ ...form, timeoutMs: v })} />
                        <NumberField id={`threshold-${s.id}`} label="Seuil d’échec" min={0} max={10}
                            value={form.failureThreshold ?? 3}
                            onValue={(v) => setForm({ ...form, failureThreshold: v })} />
                    </>
                ) : (
                    <>
                        <Info label="Type" value={s.type} mono />
                        <Info label="Cible" value={target || "—"} className="@lg:col-span-2" />
                        <Info label="Latence" value={formatLatency(service.latencyMs)} />
                        <Info label="Intervalle" value={`${s.intervalSeconds}s`} />
                        <Info label="Timeout" value={s.timeoutMs != null ? `${s.timeoutMs}ms` : "—"} />
                        <Info label="Seuil d’échec" value={`${s.failureThreshold ?? "—"}`} />
                    </>
                )}
            </div>

            <ChecksList checks={checks} error={checksError} onRetry={loadChecks} />

            <div className={cn(
                "flex flex-col gap-2 @sm:flex-row",
                isPanel && "mt-auto border-t pt-4" 
            )}>
                {editing ? (
                    <>
                        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
                        <Button size="sm" onClick={save}>Enregistrer</Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Modifier</Button>
                        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                            Supprimer
                        </Button>
                    </>
                )}
            </div>

            {/* Le seul modal légitime de la page : supprimer DOIT interrompre. */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer ce service ?</DialogTitle>
                        <DialogDescription>
                            <strong>{s.name}</strong> sera supprimé définitivement.
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Annuler</Button>
                        <Button variant="destructive" onClick={remove}>Supprimer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ChecksList({
    checks, error, onRetry,
}: { checks: MonotoringChecksResponse[]; error: string | null; onRetry: () => void }) {
    return (
        <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Derniers checks
            </h3>

            {error ? (
                <div className="rounded-lg border border-destructive/30 bg-background p-3 text-sm">
                    <p className="mb-2 text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={onRetry}>Réessayer</Button>
                </div>
            ) : checks.length === 0 ? (
                <p className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
                    Aucun check enregistré.
                </p>
            ) : (
                <ul className="divide-y rounded-lg border bg-background">
                    {checks.map((c) => (
                        <li key={c.id}
                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-3 text-sm">
                            <span className="whitespace-nowrap text-muted-foreground">
                                {new Date(c.timestamp).toLocaleString("fr-FR", {
                                    dateStyle: "short", timeStyle: "short",
                                })}
                            </span>
                            <span className="flex items-center gap-3">
                                <StatusBadge status={c.status} />
                                <span className="tabular-nums">{formatLatency(c.latencyMs)}</span>
                                <span className="tabular-nums text-muted-foreground">{c.statusCode ?? "—"}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// Create

function AddServiceDialog({
    onCreated, onError,
}: { onCreated: () => void; onError: (message: string) => void }) {
    const [form, setForm] = useState<CreateServiceRequest>(EMPTY_SERVICE);

    const set = <K extends keyof CreateServiceRequest>(key: K, value: CreateServiceRequest[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        api.services.saveNewService(form)
            .then((created) => {
                if (!created) return onError("La création a échoué. Réessayez.");
                setForm(EMPTY_SERVICE);
                onCreated();
            })
            .catch((err) => onError(err.message));
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Nouveau service</DialogTitle>
                <DialogDescription>Renseignez les informations du service à surveiller.</DialogDescription>
            </DialogHeader>

            <form onSubmit={submit}>
                <FieldGroup className="gap-4">
                    <Field>
                        <FieldLabel htmlFor="name">Nom</FieldLabel>
                        <Input id="name" required value={form.name}
                            onChange={(e) => set("name", e.target.value)} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="type">Type</FieldLabel>
                        <Select value={form.type} onValueChange={(v) => set("type", v as ServiceType)}>
                            <SelectTrigger id="type" className="w-full">
                                <SelectValue placeholder="Choisir un type" />
                            </SelectTrigger>
                            <SelectContent>
                                {serviceTypeSelect.map((i) => (
                                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="target">Cible</FieldLabel>
                        <Input id="target" required value={form.target}
                            onChange={(e) => set("target", e.target.value)} />
                    </Field>

                    <div className="flex items-center gap-3">
                        <Switch id="enabled" checked={form.enabled}
                            onCheckedChange={(c) => set("enabled", c)} />
                        <Label htmlFor="enabled">Activer la surveillance</Label>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <NumberField id="intervalSeconds" label="Intervalle (s)"
                            value={form.intervalSeconds} onValue={(v) => set("intervalSeconds", v)} />
                        <NumberField id="timeoutMs" label="Timeout (ms)"
                            value={form.timeoutMs} onValue={(v) => set("timeoutMs", v)} />
                        <NumberField id="failureThreshold" label="Seuil d’échec" min={0} max={10}
                            value={form.failureThreshold} onValue={(v) => set("failureThreshold", v)} />
                    </div>
                </FieldGroup>

                <DialogFooter className="mt-6">
                    <Button type="submit">Créer le service</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

// Helper

function NumberField({
    id, label, value, onValue, min, max,
}: {
    id: string; label: string; value: number;
    onValue: (value: number) => void; min?: number; max?: number;
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input id={id} type="number" required min={min} max={max} value={value}
                onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(parsed)) onValue(parsed);
                }} />
        </Field>
    );
}

function Info({
    label, value, mono = false, className,
}: { label: string; value: string; mono?: boolean; className?: string }) {
    return (
        <div className={cn("min-w-0", className)}>
            <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
            <p className={cn("break-all text-sm font-medium", mono && "font-mono")}>{value}</p>
        </div>
    );
}