import { msToSeconds } from "@/lib/duration";
import { Card, CardContent, CardHeader } from "../card";
import StatusBadge from "@/components/status";
import { Timer, Zap } from "lucide-react";

/** Props used to render one service summary card. */
interface ServicesCardProps {
    /** Human-readable service name. */
    services: string;
    /** Monitoring type (HTTP, TCP, etc.). */
    type: string;
    /** Latest observed latency in milliseconds. */
    latency: number | null;
    /** Check interval in seconds. */
    intervalSeconds: number;
    /** Latest service status. */
    status?: string;
}

/**
 * Compact service card used in grid views.
 * Highlights unhealthy services for faster visual triage.
 */
export default function ServicesCard({ services, type, latency, intervalSeconds, status }: ServicesCardProps) {
    const latencyDisplay = latency != null
        ? latency >= 1000 ? `${msToSeconds(latency).toFixed(2)} s` : `${latency} ms`
        : null;

    const isDown = status && status !== "UP";

    return (
        <Card className={`transition-colors ${isDown ? "border-red-500/40 bg-red-500/5" : ""} cursor-pointer` }>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm leading-tight">{services}</p>
                    <StatusBadge status={status} />
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {type}
                </span>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {latencyDisplay ?? <span className="italic">No data</span>}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {intervalSeconds}s
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}