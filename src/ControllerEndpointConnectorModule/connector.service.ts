const wsc = require('rpc-websockets').Client;
import { AppStore } from '../Store/store';
import { Inject } from 'typescript-ioc';
import * as config from 'config';

import { setConnected, setDisconnected } from './store/actions';

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

    constructor() {
        this.contollerIp = config.get('connector.ip');
        this.controllerPort = config.get('connector.port');
        this.wsurl = config.get('connector.url');
        this.url = `http://${this.contollerIp}:${this.controllerPort}/${this.wsurl}`;

        const uns = this.store.subscribe(() => {
            console.log(this.store.getState());
        });

        this.connect();
    }
}
