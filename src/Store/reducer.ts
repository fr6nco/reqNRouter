import { combineReducers } from 'redux';

//Model imports
import { ControllerConnectorStore } from '../ControllerEndpointConnectorModule/store/models';

//Function reducer imports
import { controllerConnectorModuleReducer } from '../ControllerEndpointConnectorModule/store/reducer';

/**
 * Desclares the state of the Store
 */
interface StoreState {
    controllerConnector: ControllerConnectorStore;
}

export const requestRouterApp = combineReducers({
    controllerConnector: controllerConnectorModuleReducer
});

