import { toast } from "sonner";

const baseToastStyle: React.CSSProperties = {
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
};
 
export const notify = {
    success: (title: string, description?: string) =>
        toast.success(title, {
            description,
            style: {
                ...baseToastStyle,
                background: "rgba(240, 253, 244, 0.85)", // green-50 @ 85%
                color: "#166534",                        // green-800
                border: "1px solid rgba(22, 163, 74, 0.25)",
            },
            classNames: { description: "!text-green-700/80" },
        }),
 
    error: (title: string, description?: string) =>
        toast.error(title, {
            description,
            style: {
                ...baseToastStyle,
                background: "rgba(254, 242, 242, 0.85)", // red-50 @ 85%
                color: "#991b1b",                        // red-800
                border: "1px solid rgba(220, 38, 38, 0.25)",
            },
            classNames: { description: "!text-red-700/80" },
        }),
 
    info: (title: string, description?: string) =>
        toast.info(title, {
            description,
            style: {
                ...baseToastStyle,
                background: "rgba(239, 246, 255, 0.85)", // blue-50 @ 85%
                color: "#1e40af",                        // blue-800
                border: "1px solid rgba(37, 99, 235, 0.25)",
            },
            classNames: { description: "!text-blue-700/80" },
        }),
};