const statusConfig: Record<string, { dot: string; label: string; text: string }> = {
    UP:      { dot: "bg-green-500", label: "bg-green-500/15 text-green-600", text: "UP" },
    DOWN:    { dot: "bg-red-500",   label: "bg-red-500/15 text-red-600",     text: "DOWN" },
    TIMEOUT: { dot: "bg-yellow-500", label: "bg-yellow-500/15 text-yellow-600", text: "TIMEOUT" },
};

export default function StatusBadge({ status }: { status?: string }) {
    const cfg = status ? (statusConfig[status] ?? statusConfig.DOWN) : null;

    if (!cfg) return null;

    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.label}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.text}
        </span>
    );
}

export const StatusBadgeEnabled = ({ enabled }: { enabled: boolean }) => (
 <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
      ${enabled
        ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
        : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
      }`}
  >
    {enabled ? "Enabled" : "Disabled"}
  </span>
);