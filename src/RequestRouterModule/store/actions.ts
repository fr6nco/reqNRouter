import { ServiceEngineStore } from './models';

/**
 * Request Router Actions
 */
export enum RequestRouterActions {
    // Async call
    INTRODUCE_RR_REQUEST = 'INTRODUCE_RR_REQUEST',
    INTRODUCE_RR_INIT = 'INTRODUCE_RR_INIT',
    INTRODUCE_RR_RESPONSE = 'INTRODUCE_RR_RESPONSE',
    INTRODUCE_RR_FAILURE = 'INTRODUCE_RR_FAILURE',

    // Async call
    FETCH_SERVICE_ENGINES_REQUEST = 'FETCH_SERVICE_ENGINES_REQUEST',
    FETCH_SERVICE_ENGINES_RESPONSE = 'FETCH_SERVICE_ENGINES_RESPONSE',
    FETCH_SERVICE_ENGINES_FAILURE = 'FETCH_SERVICE_ENGINES_FAILURE'
}


// Introduce RR
export interface IntroduceRRRequest {
    type: string;
    ip: string;
    port: number;
}
export function introduceRRRequest(
    ip: string,
    port: number
): IntroduceRRRequest {
    return {
        type: RequestRouterActions.INTRODUCE_RR_REQUEST,
        ip: ip,
        port: port
    };
}

// Introduce RR init from cc
export interface IntroduceRRInit {
    type: string;
}
export function introduceRRInit(): IntroduceRRInit {
    return {
        type: RequestRouterActions.INTRODUCE_RR_INIT
    };
}

// Introduce RR response
export interface IntroduceRRResponse {
    type: string
    name: string;
}
export function introduceRRResponse(name: string): IntroduceRRResponse {
    return {
        type: RequestRouterActions.INTRODUCE_RR_RESPONSE,
        name: name
    };
}

// Introduce RR failure
export interface IntroduceRRFailure {
    type: string;
    error: string;
}
export function introduceRRFailure(error: string): IntroduceRRFailure {
    return {
        type: RequestRouterActions.INTRODUCE_RR_FAILURE,
        error: error
    };
}

// Request action type
interface FetchServiceEnginesRequest {
    type: string
}
export function fetchServiceEnginesRequest(): FetchServiceEnginesRequest {
    return {
        type: RequestRouterActions.FETCH_SERVICE_ENGINES_REQUEST
    };
}

// Response action type. Returns service engines
interface FetchServiceEnginesResponse {
    type: string;
    serviceEngines: ServiceEngineStore[];
}
export function fetchServiceEnginesResponse(
    ses: ServiceEngineStore[]
): FetchServiceEnginesResponse {
    return {
        type: RequestRouterActions.FETCH_SERVICE_ENGINES_RESPONSE,
        serviceEngines: ses
    };
}

// Response action type. Returns list of Service engines
interface FetchServiceEnginesFailure {
    type: string;
    error: string;
}
export function fetchServiceEnginesFailure(
    err: string
): FetchServiceEnginesFailure {
    return {
        type: RequestRouterActions.FETCH_SERVICE_ENGINES_FAILURE,
        error: err
    };
}

export type RequestRouterActionTypes =
    | FetchServiceEnginesRequest
    | FetchServiceEnginesResponse
    | FetchServiceEnginesFailure
    | IntroduceRRFailure
    | IntroduceRRRequest
    | IntroduceRRResponse
    | IntroduceRRInit

