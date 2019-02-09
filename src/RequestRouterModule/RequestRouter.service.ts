import { ServiceEngine } from './ServiceEngine.service';
import { Inject, Singleton, AutoWired } from 'typescript-ioc';
import { ControllerConnectorService } from '../ControllerEndpointConnectorModule/connector.service';
import { ControllerConnectorStore } from '../ControllerEndpointConnectorModule/store/models';
import {
    ServiceEngineStore,
    RequestRouterStore,
    session
} from './store/models';
import { HttpEndpointModule } from '../HttpEndpointModule/httpendpoint.service';
import { httpEvent } from '../HttpEndpointModule/store/models';
import { LoggerService } from '../LoggerModule/logger.service';
import { ApiProvider } from '../ApiModule/ApiProviderInterface';

import * as express from 'express';
import * as config from 'config';
import { from } from 'rxjs';
import { take, retryWhen, delay, mergeMap } from 'rxjs/operators';

/**
 * Consider making this a singleton
 */
@Singleton
@AutoWired
export class RequestRouter implements RequestRouterStore, ApiProvider {
    name: string;
    ip: string;
    port: number;
    domain: string;
    serviceEngines: ServiceEngine[];
    lastFetched: Date | null;

    registered: boolean;

    @Inject
    ccService: ControllerConnectorService;

    @Inject
    httpServer: HttpEndpointModule;

    @Inject
    logger: LoggerService;

    moduleName: string;

    /**
     * Registers Request Router to controller
     * Domain is returned from controller, which is set
     */
    private register() {
        this.ccService
            .registerRR(this.ip, this.port)
            .then((data: { name: string; domain: string }) => {
                this.registered = true;
                this.name = data.name;
                this.domain = data.domain;
                this.httpServer.setDomain(this.domain);

                if (!this.lastFetched) {
                    this.getServiceEngines();
                }
            })
            .catch(err => {
                this.logger.error('Failed to register ' + err);
                this.registered = false;
                this.name = '';
            });
    }

    /**
     * Loads Service Engines
     */
    private getServiceEngines() {
        this.ccService
            .fetchSes()
            .then((ses: ServiceEngineStore[]) => {
                ses.forEach(se => {
                    const seInstance = new ServiceEngine(
                        se.name,
                        se.ip,
                        se.port,
                        se.domain
                    );
                    this.serviceEngines.push(seInstance);
                });
                this.lastFetched = new Date();
            })
            .catch(err => {
                this.logger.error('Failed to load ses ' + err);
            });
    }

    /**
     * Stops Service engine, stops each connection and removes from the array.
     */
    private stopSe() {
        this.serviceEngines.forEach(se => {
            se.stopConenctions();
        });
        this.serviceEngines = [];
    }

    private sendRequestCb(httpEvent: httpEvent, session: session) {
        const se = this.serviceEngines.find((se: ServiceEngine) => {
            return se.ip == session.dst_ip && se.port == session.dst_port;
        });
        if (se) {
            se.sendRequest(httpEvent, session);
        } else {
            throw new Error(
                'Service engine returned form Controller, however not found in local DB. Serious!'
            );
        }
    }

    /**
     * Starts observing events
     */
    private observeObservers() {
        /**
         * Once controller connector gets connected and req router is not registered, Register
         *
         * If Controller connector gets disconnected, deregister request router, set lastFetched to null and kill all SEs.
         */
        this.ccService.ccEvents.subscribe((data: ControllerConnectorStore) => {
            if (data.connected && !this.registered) {
                this.register();
            }
            if (!data.connected && this.registered) {
                this.registered = false;
                this.lastFetched = null;
                this.stopSe();
            }
        });

        /**
         * Subscribe to HTTP events
         *
         * If incoming HTTP request occures, get matching session from Controller and send request via SE if SE found.
         */
        this.httpServer.httpEventSubject.subscribe((httpEvent: httpEvent) => {

            from(this.ccService.getMatchingSess(
                httpEvent.req.socket.remoteAddress,
                httpEvent.req.socket.remotePort,
                httpEvent.host,
                httpEvent.port
            )).pipe(
                retryWhen(error => error.pipe(
                    delay(config.get('request_router.get_matching_sess_retry_delay')),
                    take(config.get('request_router.get_matching_sess_retries'))
                ))
            ).subscribe((session: session) => {
                this.sendRequestCb(httpEvent, session);
            })
        });
    }

    /**
     * Returns list of established sessions from service engines
     * @param req
     * @param res
     */
    getSessions(req: express.Request, res: express.Response) {
        this.logger.debug('API: requesting sessions from RR to SEs');
        const sessions = this.serviceEngines.map(se => {
            return {
                se_ip: se.ip,
                se_port: se.port,
                se_name: se.name,
                sessions: se.tcpsessions.map(tcp => {
                    return {
                        src_ip: tcp.localAddress,
                        src_port: tcp.localPort,
                        dst_ip: tcp.remoteAddress,
                        dst_port: tcp.remotePort
                    };
                })
            };
        });

        res.send({
            sessions: sessions
        });
    }

    getAssets(req: express.Request, res: express.Response) {
        this.logger.debug('API: requesting Assets');
        const data = {
            ip: this.ip,
            port: this.port,
            name: this.name,
            domain: this.domain,
            ses: this.serviceEngines.map(se => {
                return {
                    ip: se.ip,
                    port: se.port,
                    name: se.name,
                    domain: se.domain
                };
            })
        };

        res.send({
            rr: data
        });
    }

    /**
     * Returns list of sessons from the Controller
     * @param req
     * @param res
     */
    async getCntSessions(req: express.Request, res: express.Response) {
        this.logger.debug('API: requesting CNT sessions');
        try {
            const sessions = await this.ccService.getAllSessions();
            return res.send(sessions);
        } catch (err) {
            this.logger.error('Could not get sessions from controller');
            this.logger.error(err);
        }
    }

    async getTopology(req: express.Request, res: express.Response) {
        this.logger.debug('Requesting Topology from Controller');
        try {
            const topology = await this.ccService.getTopology();
            return res.send(topology);
        } catch (err) {
            this.logger.error('Failed to retrieve topology from controller');
            this.logger.error(err);
        }
    }

    getModuleName() {
        return this.moduleName;
    }

    supplyRoutes() {
        const router = express.Router();
        router.get('/sessions', this.getSessions.bind(this));
        router.get('/sessionscnt', this.getCntSessions.bind(this));
        router.get('/topology', this.getTopology.bind(this));
        router.get('/assets', this.getAssets.bind(this));
        return router;
    }

    constructor(ip: string, port: number) {
        this.ip = config.get('http.host');
        this.port = config.get('http.port');
        this.serviceEngines = [];
        this.registered = false;
        this.moduleName = 'RequestRouter';

        this.observeObservers();
    }
}
