import { ControllerConnectorStore } from './models';
import { ControllerConnectorActionTypes, ControllerConnectionActions } from './actions';

export function controllerConnectorModuleReducer(
    state: ControllerConnectorStore = {connected: false, connectorUrl: ''},
    action: ControllerConnectorActionTypes
) {
    switch (action.type) {
        case ControllerConnectionActions.SET_CONNECTED: {
            return action.cc
        }
        case ControllerConnectionActions.SET_DISCONNECTED: {
            return action.cc;
        }
        default: {
            return state;
        }
    }
}

