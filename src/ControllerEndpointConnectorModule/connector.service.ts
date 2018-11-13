const wsc = require('rpc-websockets').Client;
import * as config from 'config';
import { Subject } from 'rxjs';
import { Singleton, AutoWired } from 'typescript-ioc';

import { ControllerConnectorStore } from './store/models';

/**
 * Service class, actual magic happens here
 */
@AutoWired
@Singleton
export class ControllerConnectorService {
    contollerIp: String;
    controllerPort: number;
    wsurl: string;
    url: string;
    wsClient: any;

    public ccEvents: Subject<ControllerConnectorStore>;

    private connect() {
        this.wsClient = new wsc(this.url, {
            max_reconnects: 0
        });

        this.wsClient.on('open', () => {
            this.ccEvents.next({
                connected: true,
                connectorUrl: this.url
            });
            console.log('Controller Connector service connected to endpoint');
        });

        this.wsClient.on('close', () => {
            this.ccEvents.next({
                connected: false,
                connectorUrl: ''
            });
            console.log('Controller Connector service disconnected from endpoint');
        });
    }

    public async registerRR(ip: string, port: number) {
        try{
            const res: {code: number; res: string} = await this.wsClient.call('hello', [ip,port])
            if (res.code == 200) {
                return res.res
            } else { 
                throw res.res
            }
        } catch(err) {
            throw err;
        }
    }

    public async fetchSes() {
        try {
            const res: {code: number; res: any} = await this.wsClient.call('getses');
            if (res.code == 200) {
                return res.res;
            } else {
                throw res.res;
            }
        } catch(err) {
            throw err;
        }
    }

    constructor() {
        this.contollerIp = config.get('connector.ip');
        this.controllerPort = config.get('connector.port');
        this.wsurl = config.get('connector.url');
        this.url = `http://${this.contollerIp}:${this.controllerPort}/${
            this.wsurl
        }`;

        this.ccEvents = new Subject<ControllerConnectorStore>();
        this.connect();
    }
}
