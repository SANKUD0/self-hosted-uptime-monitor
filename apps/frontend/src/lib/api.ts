import { get } from "http";

const BASE_URL = process.env.MONOLITH_API_URL || "http://localhost:3001";

export type NumberServiceResponse = {
    count: number;
}
export type UpServiceResponse = {
    upServices: number;
}
export type DownServiceResponse = {
    downServices: number;
}
export type CountIncidentsResponse = {
    count: number;
}

export type servicesMonitoringResponse = {
    id: string;
    service: {
        name: string;
        type: string;
        target: string;
    },
    status: string;
    statusCode: number | null;
    error: string | null;
    updatedAt: string;
    latencyMs: number | null;
}

export type incidentsResponse = {
    id: string;
    startedAt: string;
    resolvedAt: string | null;
    reason: string;
    service: {
        name: string;
    }
}

export type ServicesCardInfo = {
    status: string;
    latencyMs: number | null;
    service: {
        name: string;
        type: string;
        intervalSeconds: number;
    }
}



export const api = {
    services: {
        getAll: () => fetch(`${BASE_URL}/services`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json()
        }),
        getCount: () => fetch(`${BASE_URL}/services/count`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<NumberServiceResponse>
        }),
        getCountUp: () => fetch(`${BASE_URL}/services/count/up`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<UpServiceResponse>
        }),
        getCountDown: () => fetch(`${BASE_URL}/services/count/down`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<DownServiceResponse>
        }),
        getServicesCardsInfos: () => fetch(`${BASE_URL}/services/cards/info`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<ServicesCardInfo[]>
        }),
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
    },
    incidents: {
        getAll: () => fetch(`${BASE_URL}/incidents`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<incidentsResponse[]>
        }),
        getCount: () => fetch(`${BASE_URL}/incidents/count/open`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<CountIncidentsResponse>
        }),
    },
    monitoring: {
        getAll: () => fetch(`${BASE_URL}/monitoring`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<servicesMonitoringResponse[]>
        }),
    }
}