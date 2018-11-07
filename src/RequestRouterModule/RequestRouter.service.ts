import { ServiceEngine } from './ServiceEngine.service';
import { Inject } from 'typescript-ioc';
import { AppStore } from '../Store/store';
import { StoreState } from '../Store/reducer';
import { introduceRRRequest } from './store/actions';

/**
 * Consider making this a singleton
 */
export class RequestRouter {
    name: string;
    ip: string;
    port: number;
    serviceEngines: ServiceEngine[];

    registered: boolean;

    @Inject
    store: AppStore

    private register() {
        this.store.dispatch(introduceRRRequest(this.ip, this.port));
    }

    private isRegisterRequired(store: StoreState) {
        return store.controllerConnector.connected && !store.requestRouter.registered && !store.requestRouter.isRegistering;
    }

    private isRegistered(store: StoreState) {
        return !store.requestRouter.isRegistering && store.requestRouter.registered && !this.registered
    }

    private isDisconnected(store: StoreState) {
        return this.registered && !store.requestRouter.registered
    }

    constructor(ip: string, port: number) {
        this.ip = ip;
        this.port = port;
        this.serviceEngines = [];
        this.registered = false;

        this.store.subscribe(() => {
            const store: StoreState = this.store.getState();
            if (this.isRegistered(store)) {
                // Freshly set registered in store, but locally registered is false
                console.log('Request Router registered successfully');
                this.name = store.requestRouter.name;
                this.registered = true;
            }
            if (this.isDisconnected(store)) {
                // Registered set to false by store and registered locally is true means disconnection
                console.log('Request router disconnected');
                this.registered = false;
            }
            if (this.isRegisterRequired(store)) {
                // if cc connected and we are not registered
                console.log('Request Router requested a register action');
                this.register();
            }
        });
    }
}
