const wsc = require('rpc-websockets').Client;
import * as config from 'config';
import { Subject } from 'rxjs';
import { Singleton, AutoWired, Inject } from 'typescript-ioc';

import { ControllerConnectorStore } from './store/models';
import { session } from '../RequestRouterModule/store/models';
import { LoggerService } from '../LoggerModule/logger.service';
import { ApiProvider } from '../ApiModule/ApiProviderInterface';
import * as express from 'express';

/**
 * Service class, actual magic happens here
 */
@AutoWired
@Singleton
export class ControllerConnectorService implements ApiProvider {
    moduleName: string;
    contollerIp: string;
    controllerPort: number;
    wsurl: string;
    url: string;
    wsClient: any;
    connected: boolean;

    @Inject
    logger: LoggerService;

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
            this.connected =  true;
            this.logger.log('Controller Connector service connected to endpoint');
        });

        this.wsClient.on('close', () => {
            this.ccEvents.next({
                connected: false,
                connectorUrl: ''
            });
            this.connected = false;
            this.logger.log('Controller Connector service disconnected from endpoint');
        });
    }

    public async registerRR(ip: string, port: number) {
        try{
            const res: {code: number; res: { name: string; domain: string }} = await this.wsClient.call('hello', [ip,port])
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

    public async getMatchingSess(src_ip: string, src_port: number, dst_ip: string, dst_port: number) {
        try {
            const res: {code: number; res: session} = await this.wsClient.call('getmatchingsess', [src_ip, src_port, dst_ip, dst_port])
            if (res.code == 200) {
                return res.res;
            } else {
                throw res.res;
            }
        } catch(err) {
            throw err;
        }
    }

    public async getAllSessions() {
        try {
            const res: {code: number; res: any} = await this.wsClient.call('getallsessions');
            if (res.code == 200) {
                return res.res;
            } else {
                throw res.res;
            }
        } catch(err) {
            throw err;
        }
    }

    public async getTopology() {
        try {
            const res: {code: number; res:any} = await this.wsClient.call('gettopology');
            if (res.code == 200) {
                return res.res;
            } else {
                throw res.res;
            }
        } catch(err) {
            throw err;
        }
    }
    
    /**
     * Returns the state of the controller API call
     * @param req 
     * @param res 
     */
    private statusController(req: express.Request, res: express.Response) {
        res.send({
            'url': this.url,
            'connected': this.connected
        });
    }

    getModuleName() {
        return this.moduleName;
    }

    supplyRoutes() {
        const router = express.Router();
        router.get('/status', this.statusController.bind(this));
        return router;
    }

    constructor() {
        this.moduleName = 'ControllerConnector';
        this.contollerIp = config.get('connector.ip');
        this.controllerPort = config.get('connector.port');
        this.connected = false;
        this.wsurl = config.get('connector.url');
        this.url = `http://${this.contollerIp}:${this.controllerPort}/${
            this.wsurl
        }`;

        this.ccEvents = new Subject<ControllerConnectorStore>();
        this.connect();
    }
}
