import { Singleton } from 'typescript-ioc';
import { createStore, Store } from 'redux';

import { requestRouterApp } from './reducer';

@Singleton
export class AppStore {
    store: Store;
    
    constructor() {
        this.store = createStore(requestRouterApp);
    }
    
    public dispatch(action: any) {
        this.store.dispatch(action);
    }

    public subscribe(listener: () => any) {
        return this.store.subscribe(listener);
    }

    public getState() {
        return this.store.getState();
    }
}
