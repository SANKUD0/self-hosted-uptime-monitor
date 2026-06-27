import { get } from "http";

const BASE_URL = process.env.MONOLITH_API_URL! || "http://localhost:3004";

/** Response payload for total services count. */
export type NumberServiceResponse = {
    count: number;
}
/** Response payload for healthy services count. */
export type UpServiceResponse = {
    upServices: number;
}
/** Response payload for unhealthy services count. */
export type DownServiceResponse = {
    downServices: number;
}
/** Response payload for open incidents count. */
export type CountIncidentsResponse = {
    count: number;
}

/** Monitoring snapshot for a single service. */
export type servicesMonitoringResponse = {
    id: string;
    service: {
        name: string;
        type: string;
        target: string;
        enabled: boolean;
    },
    status: string;
    statusCode: number | null;
    error: string | null;
    updatedAt: string;
    latencyMs: number | null;
}

/** Incident entry returned by the incidents API. */
export type incidentsResponse = {
    id: string;
    startedAt: string;
    resolvedAt: string | null;
    reason: string;
    service: {
        name: string;
    }
}

/** Card-ready service data returned by the dashboard endpoint. */
export type ServicesCardInfo = {
    status: string;
    latencyMs: number | null;
    service: {
        id: string;
        name: string;
        type: string;
        intervalSeconds: number;
        timeoutMs: number;
        failureThreshold: number;
        enabled: boolean;
    }
}

/** Monitoring check history entry for a service. */
export type MonotoringChecksResponse = {
    id: string;
    serviceId: string;
    status: string;
    latencyMs: number | null;
    statusCode: number | null;
    error: string | null;
    timestamp: string;
}



/**
 * Lightweight typed API client for the monolith backend.
 *
 * Each method throws an `Error` for non-2xx responses to keep error handling
 * consistent in React query hooks and UI components.
 */
export const api = {
    services: {
        /** Fetches all registered services. */
        getAll: () => fetch(`${BASE_URL}/services`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json()
        }),
        /** Fetches one service by its identifier. */
        getService: (id: string) => fetch(`${BASE_URL}/services/${id}`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json()
        }),
        /** Fetches the total number of services. */
        getCount: () => fetch(`${BASE_URL}/services/count`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<NumberServiceResponse>
        }),
        /** Fetches the number of services currently up. */
        getCountUp: () => fetch(`${BASE_URL}/services/count/up`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<UpServiceResponse>
        }),
        /** Fetches the number of services currently down. */
        getCountDown: () => fetch(`${BASE_URL}/services/count/down`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<DownServiceResponse>
        }),
        /** Fetches compact service data used by dashboard cards. */
        getServicesCardsInfos: () => fetch(`${BASE_URL}/services/cards/info`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<ServicesCardInfo[]>
        }),
        /** Creates a new monitored service. */
        saveNewService: (service: { name: string; type: string; target: string; intervalSeconds: number; timeoutMs: number; failureThreshold: number; enabled: boolean }) => fetch(`${BASE_URL}/services`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(service),
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json();
        }),
        /** Deletes a service by id. */
        delete: (id: string) => fetch(`${BASE_URL}/services/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
        }),
        /** Partially updates a service by id. */
        patch: (id: string, service: { name?: string; type?: string; target?: string; intervalSeconds?: number; timeoutMs?: number; failureThreshold?: number; enabled?: boolean }) => fetch(`${BASE_URL}/services/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(service),
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json();
        }),
        /** Toggles the enabled state of a service. */
        enableDisableService: (id: string, isActive: boolean) => fetch(`${BASE_URL}/services/${id}/enable-disable`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ enabled: isActive }),
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json();
        }),
    },
    incidents: {
        /** Fetches all incidents. */
        getAll: () => fetch(`${BASE_URL}/incidents`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<incidentsResponse[]>
        }),
        /** Fetches the number of currently open incidents. */
        getCount: () => fetch(`${BASE_URL}/incidents/count/open`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<CountIncidentsResponse>
        }),
        /** Resolves an incident by id with a provided root cause. */
        resolve: (id: string, rootCause: string) => fetch(`${BASE_URL}/incidents/${id}/resolve`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ rootCause }),
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json();
        }),
    },
    monitoring: {
        /** Fetches latest monitoring state for all services. */
        getAll: () => fetch(`${BASE_URL}/monitoring`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<servicesMonitoringResponse[]>
        }),
        /** Fetches the five most recent checks for a service. */
        get5FirstRecentChecksForService: ({ id }: { id: string }) => fetch(`${BASE_URL}/monitoring/${id}/checks`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<MonotoringChecksResponse[]>
        }),
    }
}