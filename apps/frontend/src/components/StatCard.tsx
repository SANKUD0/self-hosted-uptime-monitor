import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CardFetchError } from "./ui/fetch-error/card-fetch-error";
import { Spinner } from "./ui/spinner";
import { cn } from "@/lib/utils";

type StatCardAccent = "default" | "success" | "danger" | "warning";

/** Presentation contract for the generic dashboard statistic card. */
interface StatCardProps {
    /** Card heading shown in the top-left area. */
    title: string;
    /** Primary value. `null`/`undefined` renders a loading state. */
    value?: number | string | null;
    /** Optional secondary context text displayed under the value. */
    description?: string;
    /** Optional error message shown instead of the value. */
    error?: string | null;
    /** Optional icon component displayed in the card header. */
    icon?: LucideIcon;
    /** Semantic accent used for value and decoration styling. */
    accent?: StatCardAccent;
}

const accentStyles: Record<StatCardAccent, { ring: string; icon: string; value: string }> = {
    default: {
        ring: "before:bg-primary/60",
        icon: "bg-primary/10 text-primary",
        value: "text-foreground",
    },
    success: {
        ring: "before:bg-emerald-500/70",
        icon: "bg-emerald-500/10 text-emerald-600",
        value: "text-emerald-600",
    },
    danger: {
        ring: "before:bg-red-500/70",
        icon: "bg-red-500/10 text-red-600",
        value: "text-red-600",
    },
    warning: {
        ring: "before:bg-amber-500/70",
        icon: "bg-amber-500/10 text-amber-600",
        value: "text-amber-600",
    },
};

/**
 * Reusable KPI card with built-in loading and error states.
 */
export function StatCard({ title, value, description, error, icon: Icon, accent = "default" }: StatCardProps) {
    const styles = accentStyles[accent];

    return (
        <Card
            className={cn(
                "relative w-full overflow-hidden transition-shadow hover:shadow-md",
                "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
                styles.ring
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    {Icon && (
                        <span className={cn("flex size-8 items-center justify-center rounded-lg", styles.icon)}>
                            <Icon className="size-4" />
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col">
                <div className={cn("text-3xl font-bold tabular-nums", !error && styles.value)}>
                    {error ? (
                        <CardFetchError message={error} />
                    ) : value === null || value === undefined ? (
                        <Spinner className="size-6" />
                    ) : (
                        value
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}