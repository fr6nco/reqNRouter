import { combineReducers } from 'redux';

//Model imports
import { ControllerConnectorStore } from '../ControllerEndpointConnectorModule/store/models';
import { RequestRouterStore } from '../RequestRouterModule/store/models';

//Function reducer imports
import { controllerConnectorModuleReducer } from '../ControllerEndpointConnectorModule/store/reducer';
import { requestRouterReducer } from '../RequestRouterModule/store/reducer';

/**
 * Desclares the state of the Store
 */
export interface StoreState {
    controllerConnector: ControllerConnectorStore;
    requestRouter: RequestRouterStore;
}

export const requestRouterApp = combineReducers({
    controllerConnector: controllerConnectorModuleReducer,
    requestRouter: requestRouterReducer
});

