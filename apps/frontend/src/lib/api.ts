import { get } from "http";

const BASE_URL = process.env.MONOLITH_API_URL || "http://localhost:3001";

export type NumberServiceResponse = {
    count: number;
}
export type UpServiceResponse = {
    UpServices: number;
}
export type DownServiceResponse = {
    DownServices: number;
}
export type CountIncidentsResponse = {
    count: number;
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
    },
    incidents: {
        getAll: () => fetch(`${BASE_URL}/incidents`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json()
        }),
        getCount: () => fetch(`${BASE_URL}/incidents/count/open`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json() as Promise<CountIncidentsResponse>
        }),
    },
    monitoring: {
        getAll: () => fetch(`${BASE_URL}/monitoring`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} `);
            return res.json()
        }),
    }
}