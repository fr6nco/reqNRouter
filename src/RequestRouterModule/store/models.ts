/**
 * Store for the service engines
 */
export interface ServiceEngineStore {
    name: string;
    ip: string;
    port: number;
    domain: string;
}

export interface RequestRouterStore {
    name: string;
    ip: string;
    port: number;
    domain: string;
}

export interface session {
    src_ip: string;
    src_port: number;
    dst_ip: string;
    dst_port: number;
}
