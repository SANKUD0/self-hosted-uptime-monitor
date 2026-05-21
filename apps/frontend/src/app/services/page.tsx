"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/status";
import { api, ServicesCardInfo } from "@/lib/api";
import { msToSeconds } from "@/lib/duration";
import { X, Zap, Timer } from "lucide-react";
import { useEffect, useState } from "react";

export default function ServicesPage() {
    const [services, setServices] = useState<ServicesCardInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<ServicesCardInfo | null>(null);
    const [newService, setNewService] = useState({
        name: "",
        type: "",
        target: "",
        intervalSeconds: 60,
        timeoutMs: 5000,
        failureThreshold: 3,
        enabled: true,
    });

    const fetchServices = () => {
        api.services.getServicesCardsInfos()
            .then(setServices)
            .catch((err) => setError(err.message));
        // api.services.getService()
        //     .then(setServices)
        //     .catch((err) => setError(err.message));
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        api.services.saveNewService(newService)
            .then(() => {
                fetchServices();
                setOpen(false);
                setNewService({
                    name: "", type: "", target: "",
                    intervalSeconds: 60, timeoutMs: 5000,
                    failureThreshold: 3, enabled: true,
                });
            })
            .catch((err) => setError(err.message));
    };

    return (
        <div className="flex h-[calc(100vh-40px)]">

            {/* ── Gauche : table ── */}
            <div className={`flex flex-col transition-all duration-300 ${selected ? 'w-2/5' : 'w-full'
                }`}>
                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        Services
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({services.length})
                        </span>
                    </h1>

                    {/* Dialog Ajouter */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="cursor-pointer">
                                + Add Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a new Service</DialogTitle>
                                <DialogDescription>
                                    Fill in the details for the new service.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <FieldGroup className="gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="name">Name</FieldLabel>
                                        <Input id="name" required value={newService.name}
                                            onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="type">Type</FieldLabel>
                                        <Input id="type" required value={newService.type}
                                            onChange={(e) => setNewService({ ...newService, type: e.target.value })} />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="target">Target</FieldLabel>
                                        <Input id="target" required value={newService.target}
                                            onChange={(e) => setNewService({ ...newService, target: e.target.value })} />
                                    </Field>
                                    <Field orientation="horizontal" className="items-center gap-3">
                                        <input id="enabled" type="checkbox" checked={newService.enabled}
                                            onChange={(e) => setNewService({ ...newService, enabled: e.target.checked })}
                                            className="h-4 w-4 cursor-pointer accent-primary" />
                                        <FieldLabel htmlFor="enabled" className="cursor-pointer">
                                            Service Enabled
                                        </FieldLabel>
                                    </Field>
                                    <div className="grid grid-cols-3 gap-3 items-end">
                                        <Field>
                                            <FieldLabel htmlFor="intervalSeconds">Interval (s)</FieldLabel>
                                            <Input id="intervalSeconds" type="number" required value={newService.intervalSeconds}
                                                onChange={(e) => setNewService({ ...newService, intervalSeconds: parseInt(e.target.value) })} />
                                        </Field>
                                        <Field>
                                            <div>
                                                <FieldLabel htmlFor="timeoutMs">Timeout (ms)</FieldLabel>
                                                <span className="text-xs text-muted-foreground pl-2">
                                                    {msToSeconds(newService.timeoutMs)}sec
                                                </span>
                                            </div>
                                            <Input id="timeoutMs" type="number" required value={newService.timeoutMs}
                                                onChange={(e) => setNewService({ ...newService, timeoutMs: parseInt(e.target.value) })} />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="failureThreshold">Failure Threshold</FieldLabel>
                                            <Input id="failureThreshold" type="number" min="0" max="10" required
                                                value={newService.failureThreshold}
                                                onChange={(e) => setNewService({ ...newService, failureThreshold: parseInt(e.target.value) })} />
                                        </Field>
                                    </div>
                                </FieldGroup>
                                <DialogFooter className="mt-6">
                                    <Button type="submit" className="cursor-pointer">Create Service</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table */}
                <div className="px-6 pb-6 overflow-auto">
                    {error && (
                        <p className="text-sm text-destructive mb-4">{error}</p>
                    )}
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-3 font-medium">Nom</th>
                                    <th className="text-left p-3 font-medium">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                                            Aucun service. Ajoutez-en un!
                                        </td>
                                    </tr>
                                ) : services.map((s) => (
                                    <tr
                                        key={s.service.id}
                                        onClick={() => setSelected(
                                            selected?.service.id === s.service.id ? null : s
                                        )}
                                        className={`border-t cursor-pointer transition-colors ${selected?.service.id === s.service.id
                                            ? 'bg-primary/5 border-l-2 border-l-primary'
                                            : 'hover:bg-muted/30'
                                            }`}
                                    >
                                        <td className="p-3 font-medium">{s.service.name}</td>

                                        <td className="p-3">
                                            <StatusBadge status={s.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Droite : panneau détail ── */}
            {selected && (
                <div className="w-3/5 border-l p-6 overflow-auto">
                    <ServiceDetailPanel
                        service={selected}
                        onClose={() => setSelected(null)}
                        onRefresh={fetchServices}
                    />
                </div>
            )}
        </div>
    );
}

// ── Panneau de détail (dans le même fichier pour commencer) ──
function ServiceDetailPanel({ service, onClose, onRefresh, }: { service: ServicesCardInfo; onClose: () => void; onRefresh: () => void; }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<any>(null);

    const handleDelete = async (id: string) => {
        await api.services.delete(id);
        setConfirmOpen(false);
        onRefresh();
        onClose();
    };

    useEffect(() => {
        api.services.getService(service.service.id)
            .then((data) => {
                setDetails(data);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, [service.service.id]);

    // const handleToggle = async () => {
    //     await api.services.patch(service.service.id, {
    //     });
    //     onRefresh();
    // };
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">{service.service.name}</h2>
                    <div className="mt-1">
                        <StatusBadge status={service.status} />
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors" >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Infos */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoItem label="Type" value={service.service.type} mono />
                <InfoItem label="Target" value={details?.target ?? '—'} />
                <InfoItem label="Intervalle" value={`${service.service.intervalSeconds}s`} />
                <InfoItem label="Latence" value={service.latencyMs != null ? service.latencyMs >= 1000 ? `${msToSeconds(service.latencyMs).toFixed(2)}s` : `${service.latencyMs}ms` : '—'} />
            </div>

            {/* Derniers checks — à venir */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    Derniers checks
                </h3>
                <p className="text-sm text-muted-foreground italic">
                    À implémenter — GET /services/{service.service.id}/checks
                </p>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2 pt-4 border-t">
                {/* Boutton supprimer */}
                <Button variant="destructive" size="sm" className="cursor-pointer" onClick={() => setConfirmOpen(true)}>
                    Supprimer
                </Button>
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer ce service ?</DialogTitle>
                            <DialogDescription>
                                Vous êtes sur le point de supprimer <strong>{service.service.name}</strong>. Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2">
                            <Button variant="outline" className="cursor-pointer" onClick={() => setConfirmOpen(false)}>
                                Annuler
                            </Button>
                            <Button variant="destructive" className="cursor-pointer" onClick={() => handleDelete(service.service.id)}>
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/*TODO Désactiver / Réactiver service */}
                {/* TODO Modifier le service */}

            </div>
        </div>
    );
}

function InfoItem({ label, value, mono = false }: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
    );
}