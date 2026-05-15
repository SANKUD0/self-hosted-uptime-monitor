import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Spinner } from "./ui/spinner";

// components/StatCard.tsx
interface StatCardProps {
    title: string;
    value?: number | string | null;
    description?: string;
    error?: string | null;
}

export function StatCard({ title, value, description, error  }: StatCardProps) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground text-center">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="text-3xl font-bold">
                    {error
                        ? <p className="text-sm text-destructive text-center">{error}</p>
                        : value == null ? <Spinner /> : value
                    }
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1 text-center">{description}</p>
                )}

            </CardContent>
        </Card>
    );
}