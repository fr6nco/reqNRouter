import { Singleton, AutoWired } from 'typescript-ioc';
import { createStore, Store } from 'redux';

import { requestRouterApp } from './reducer';

/**
 * We want to use this class as a singleton in DI so we are wrapping arount the Appstore and instantiate the store here.
 */
@Singleton
@AutoWired
export class AppStore {
    store: Store;
    
    constructor() {
        this.store = createStore(requestRouterApp);
    }
    
    public dispatch(action: any) {
        return this.store.dispatch(action);
    }

    public subscribe(listener: () => any) {
        return this.store.subscribe(listener);
    }

    public getState() {
        return this.store.getState();
    }
}
