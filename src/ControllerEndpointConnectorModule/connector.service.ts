const wsc = require('rpc-websockets').Client;
import { AppStore } from '../Store/store';
import { StoreState } from '../Store/reducer';
import { Inject } from 'typescript-ioc';
import * as config from 'config';

import { setConnected, setDisconnected } from './store/actions';
import {
    introduceRRInit,
    introduceRRResponse,
    introduceRRFailure
} from '../RequestRouterModule/store/actions';

/**
 * Service class, actual magic happens here
 */
export class ControllerConnectorService {
    contollerIp: String;
    controllerPort: number;
    wsurl: string;
    url: string;
    wsClient: any;

    @Inject
    store: AppStore;

    private connect() {
        this.wsClient = new wsc(this.url, {
            max_reconnects: 0
        });

        this.wsClient.on('open', () => {
            this.store.dispatch(setConnected(this.url));
        });

        this.wsClient.on('close', () => {
            this.store.dispatch(setDisconnected());
        });
    }

    private registerRR(ip: string, port: number) {
        this.wsClient
            .call('hello', [ip, port])
            .then((res: { code: number; res: string }) => {
                if (res.code == 200) {
                    this.store.dispatch(introduceRRResponse(res.res));
                } else {
                    this.store.dispatch(introduceRRFailure(res.res));
                }
            })
            .catch((err: any) => {
                this.store.dispatch(introduceRRFailure(err));
            });

        this.store.dispatch(introduceRRInit());
    }

    private isRegisterRequested(store: StoreState) {
        return (
            store.requestRouter.isRegistering &&
            !store.requestRouter.isRegisterInitiated
        );
    }

    constructor() {
        this.contollerIp = config.get('connector.ip');
        this.controllerPort = config.get('connector.port');
        this.wsurl = config.get('connector.url');
        this.url = `http://${this.contollerIp}:${this.controllerPort}/${
            this.wsurl
        }`;

        const uns = this.store.subscribe(() => {
            const store: StoreState = this.store.getState();
            if (this.isRegisterRequested(store)) {
                this.registerRR(
                    store.requestRouter.ip,
                    store.requestRouter.port
                );
            }
        });

        this.connect();
    }
}
