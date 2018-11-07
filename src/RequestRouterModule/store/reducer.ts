import { RequestRouterStore } from './models';
import {
    RequestRouterActionTypes,
    RequestRouterActions,
    IntroduceRRRequest,
    IntroduceRRResponse,
    IntroduceRRFailure
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
        case RequestRouterActions.FETCH_SERVICE_ENGINES_FAILURE: {
            return {
                ...state,
                registered: false,
                isRegisterInitiated: false,
                errored: true,
                isRegistering: false,
                errormsg: (<IntroduceRRFailure>action).error
            };
        }
        case ControllerConnectionActions.SET_DISCONNECTED: {
            return {
                ...state,
                registered: false,
                isRegistering: false,
                isRegisterInitiated: false,
                errored: false,
                errormsg: ''
            };
        }
        default: {
            return state;
        }
    }
}
