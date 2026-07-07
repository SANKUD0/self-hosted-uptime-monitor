import { ExternalToast, toast } from "sonner";

const baseToastStyle: React.CSSProperties = {
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
};

export const notify = {
    success: (title: string, description?: string, opts?: ExternalToast) =>
        toast.success(title, {
            description,
            style: {
                ...baseToastStyle,
                background: "rgba(240, 253, 244, 0.85)",
                color: "#166534",
                border: "1px solid rgba(22, 163, 74, 0.25)",
            },
            classNames: { description: "!text-green-700/80" },
            ...opts,
        }),

    error: (title: string, description?: string, opts?: ExternalToast) =>
        toast.error(title, {
            description,
            style: {
                ...baseToastStyle,
                background: "rgba(254, 242, 242, 0.85)",
                color: "#991b1b",
                border: "1px solid rgba(220, 38, 38, 0.25)",
            },
            classNames: { description: "!text-red-700/80" },
            ...opts,
        }),

    info: (title: string, description?: string, opts?: ExternalToast) =>
        toast.info(title, {
            description,
            style: {
                ...baseToastStyle,
                background: "rgba(239, 246, 255, 0.85)",
                color: "#1e40af",
                border: "1px solid rgba(37, 99, 235, 0.25)",
            },
            classNames: { description: "!text-blue-700/80" },
            ...opts,
        }),

    // ← nouveau : loading stylé, cohérent avec le reste
    loading: (title: string, description?: string, opts?: ExternalToast) =>
        toast.loading(title, {
            description,
            style: {
                ...baseToastStyle,
                background: "rgba(248, 250, 252, 0.85)", // slate-50 @ 85%
                color: "#334155",                        // slate-700
                border: "1px solid rgba(100, 116, 139, 0.25)",
            },
            classNames: { description: "!text-slate-600/80" },
            ...opts,
        }),

    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((value: T) => string);
            error: string | ((err: unknown) => string);
            description?: string;
        }
    ) => {
        const id = notify.loading(messages.loading);

        promise
            .then((value) => {
                const title = typeof messages.success === "function" ? messages.success(value) : messages.success;
                notify.success(title, messages.description, { id });
            })
            .catch((err) => {
                const title = typeof messages.error === "function" ? messages.error(err) : messages.error;
                notify.error(title, undefined, { id });
            });

        return promise;
    },
};