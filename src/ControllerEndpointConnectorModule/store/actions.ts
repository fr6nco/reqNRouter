import { ControllerConnectorStore } from './models';

/**
 * Controller connector state actions
 */
export enum ControllerConnectionActions {
    SET_CONNECTED = 'SET_CONNECTED',
    SET_DISCONNECTED = 'SET_DISCONNECTED'
}

/**
 * Base Action Type
 */
interface BaseAction {
    type: string
}

/**
 * Base type for controller connector actions
 */
interface baseControllerConnectorActionType extends BaseAction {
    cc: ControllerConnectorStore
}

/**
 * Set connected action and type
 */
interface setConnectedType extends baseControllerConnectorActionType {}
export function setConnected(url: string): setConnectedType  {
    return {
        type: ControllerConnectionActions.SET_CONNECTED,
        cc: {
            connected: true,
            connectorUrl: url
        }
    };
}

/**
 * Set disconnected action and type
 */
interface setDisconnectedType extends baseControllerConnectorActionType {}
export function setDisconnected(): setDisconnectedType {
    return {
        type: ControllerConnectionActions.SET_DISCONNECTED,
        cc: {
            connected: false,
            connectorUrl: ''
        }
    }
}

export type ControllerConnectorActionTypes = setConnectedType | setDisconnectedType;