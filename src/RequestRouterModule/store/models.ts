/**
 * Main store for the requestrouter module
 */
export interface RequestRouterStore {
    name: string;
    ip: string;
    port: number;
    registered: boolean;
    isRegistering: boolean;
    isRegisterInitiated: boolean;
    errored: boolean;
    errormsg: string;
    serviceEngines: {
        isFetching: boolean;
        isFetchingInitiated: boolean;
        lastFetched: Date | null;
        errored: boolean;
        errormsg: string;
        ses: ServiceEngineStore[];
    }
}

/**
 * Store for the service engines
 */
export interface ServiceEngineStore {
    name: string;
    ip: string;
    port: number;
}
