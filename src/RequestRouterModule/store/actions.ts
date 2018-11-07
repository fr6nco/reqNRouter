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
    FETCH_SERVICE_ENGINES_INIT = 'FETCH_SERVICE_ENGINES_INIT',
    FETCH_SERVICE_ENGINES_RESPONSE = 'FETCH_SERVICE_ENGINES_RESPONSE',
    FETCH_SERVICE_ENGINES_FAILURE = 'FETCH_SERVICE_ENGINES_FAILURE',

    IMA_DUMMY_ACTION = 'IMA_DUMMY_ACTION'
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

// Introduce SE init from cc
export interface FetchServiceEnginesInit {
    type: string;
}
export function fetchServiceEnginesInit(): FetchServiceEnginesInit {
    return {
        type: RequestRouterActions.FETCH_SERVICE_ENGINES_INIT
    };
}

// Response action type. Returns service engines
export interface FetchServiceEnginesResponse {
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

interface ImaDummyAction {
    type: string;
}
export function imaDummyAction(): ImaDummyAction {
    return  {
        type: RequestRouterActions.IMA_DUMMY_ACTION
    }
}

export type RequestRouterActionTypes =
    | FetchServiceEnginesRequest
    | FetchServiceEnginesInit
    | FetchServiceEnginesResponse
    | FetchServiceEnginesFailure
    | IntroduceRRFailure
    | IntroduceRRRequest
    | IntroduceRRResponse
    | IntroduceRRInit
    | ImaDummyAction

