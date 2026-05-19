"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ServicesCard from "@/components/ui/services/ServicesCard";
import { api, ServicesCardInfo } from "@/lib/api";
import { msToSeconds } from "@/lib/duration";
import { useEffect, useState } from "react";

export default function ServicesPage() {
    const [services, setServices] = useState<ServicesCardInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
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
            .then((data) => setServices(data))
            .catch((err) => setError(err.message));
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
            })
            .catch((err) => setError(err.message));
    };

    return (
        <div className="m-10">
            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Services</CardTitle>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer">+ Add Service</Button>
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
                                                <Input id="name" required value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="type">Type</FieldLabel>
                                                <Input id="type" required value={newService.type} onChange={(e) => setNewService({ ...newService, type: e.target.value })} />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="target">Target</FieldLabel>
                                                <Input id="target" required value={newService.target} onChange={(e) => setNewService({ ...newService, target: e.target.value })} />
                                            </Field>
                                            <Field orientation="horizontal" className="items-center gap-3">
                                                <input id="enabled" type="checkbox" checked={newService.enabled} onChange={(e) => setNewService({ ...newService, enabled: e.target.checked })} className="h-4 w-4 cursor-pointer accent-primary" />
                                                <FieldLabel htmlFor="enabled" className="cursor-pointer" >Service Enabled</FieldLabel>
                                            </Field>
                                            <div className="grid grid-cols-3 gap-3 items-end">
                                                <Field>
                                                    <FieldLabel htmlFor="intervalSeconds">Interval (s)</FieldLabel>
                                                    <Input id="intervalSeconds" type="number" required value={newService.intervalSeconds} onChange={(e) => setNewService({ ...newService, intervalSeconds: parseInt(e.target.value) })} />
                                                </Field>
                                                <Field>
                                                    <div>
                                                        <FieldLabel htmlFor="timeoutMs">Timeout (ms)</FieldLabel>
                                                        <span className="text-xs text-muted-foreground pl-2">{msToSeconds(newService.timeoutMs)}sec</span>
                                                    </div>
                                                    <Input id="timeoutMs" type="number" required value={newService.timeoutMs} onChange={(e) => setNewService({ ...newService, timeoutMs: parseInt(e.target.value) })} />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="failureThreshold">Failure Threshold</FieldLabel>
                                                    <Input id="failureThreshold" type="number" min="0" max="10" required value={newService.failureThreshold} onChange={(e) => setNewService({ ...newService, failureThreshold: parseInt(e.target.value) })} />
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
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {error ? <p className="text-sm text-destructive text-center">{error}</p> : (
                                <>
                                    {services.map((service, index) => (
                                        <div key={index}>
                                            <ServicesCard
                                                services={service.service.name}
                                                type={service.service.type}
                                                latency={service.latencyMs}
                                                intervalSeconds={service.service.intervalSeconds}
                                                status={service.status} />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}