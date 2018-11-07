import { RequestRouterStore } from './models';
import {
    RequestRouterActionTypes,
    RequestRouterActions,
    IntroduceRRRequest,
    IntroduceRRResponse,
    IntroduceRRFailure,
    FetchServiceEnginesResponse
} from './actions';

import {
    ControllerConnectorActionTypes, ControllerConnectionActions
} from '../../ControllerEndpointConnectorModule/store/actions';

export function requestRouterReducer(
    state: RequestRouterStore = {
        name: '',
        ip: '',
        port: 0,
        registered: false,
        isRegistering: false,
        isRegisterInitiated: false,
        errored: false,
        errormsg: '',
        serviceEngines: {
            isFetching: false,
            isFetchingInitiated: false,
            lastFetched: null,
            errored: false,
            errormsg: '',
            ses: []
        }
    },
    action: RequestRouterActionTypes | ControllerConnectorActionTypes
) {
    switch (action.type) {
        case RequestRouterActions.INTRODUCE_RR_REQUEST: {
            return {
                ...state,
                ip: (<IntroduceRRRequest>action).ip,
                port: (<IntroduceRRRequest>action).port,
                isRegistering: true,
                errored: false,
                errormsg: ''
            };
        }
        case RequestRouterActions.INTRODUCE_RR_INIT: {
            return {
                ...state,
                isRegisterInitiated: true
            }
        }
        case RequestRouterActions.INTRODUCE_RR_RESPONSE: {
            return {
                ...state,
                name: (<IntroduceRRResponse>action).name,
                isRegistering: false,
                isRegisterInitiated: false,
                errored: false,
                errormsg: '',
                registered: true
            };
        }
        case RequestRouterActions.INTRODUCE_RR_FAILURE: {
            return {
                ...state,
                registered: false,
                isRegisterInitiated: false,
                errored: true,
                isRegistering: false,
                errormsg: (<IntroduceRRFailure>action).error
            };
        }
        case RequestRouterActions.FETCH_SERVICE_ENGINES_REQUEST: {
            return  {
                ...state,
                serviceEngines: {
                    ...state.serviceEngines,
                    isFetching: true,
                    errored: false,
                    errormsg: ''
                }
            }
        }
        case RequestRouterActions.FETCH_SERVICE_ENGINES_INIT: {
            return {
                ...state,
                serviceEngines: {
                    ...state.serviceEngines,
                    isFetchingInitiated: true
                }
            }
        }
        case RequestRouterActions.FETCH_SERVICE_ENGINES_RESPONSE: {
            return {
                ...state,
                serviceEngines: {
                    ...state.serviceEngines,
                    isFetching: false,
                    isFetchingInitiated: false,
                    lastFetched: new Date(),
                    errored: false,
                    errormsg: '',
                    ses: (<FetchServiceEnginesResponse>action).serviceEngines
                }
            }
        }
        case ControllerConnectionActions.SET_DISCONNECTED: {
            return {
                ...state,
                registered: false,
                isRegistering: false,
                isRegisterInitiated: false,
                errored: false,
                errormsg: '',
                serviceEngines: {
                    ...state.serviceEngines,
                    ses: [],
                    lastFetched: null
                }
            };
        }
        default: {
            return state;
        }
    }
}
