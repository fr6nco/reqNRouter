import { ServiceEngine } from './ServiceEngine.service';
import { Inject, Singleton, AutoWired } from 'typescript-ioc';
import { ControllerConnectorService } from '../ControllerEndpointConnectorModule/connector.service';
import { ControllerConnectorStore } from '../ControllerEndpointConnectorModule/store/models';
import { ServiceEngineStore, RequestRouterStore, session } from './store/models';
import { HttpEndpointModule } from '../HttpEndpointModule/httpendpoint.service';
import { httpEvent } from '../HttpEndpointModule/store/models';
import { LoggerService } from '../LoggerModule/logger.service';

import * as config from 'config';

/**
 * Consider making this a singleton
 */
@Singleton
@AutoWired
export class RequestRouter implements RequestRouterStore {
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

    /**
     * Registers Request Router to controller
     * Domain is returned from controller, which is set
     */
    private register() {
        this.ccService.registerRR(this.ip, this.port)
            .then((data:{ name: string; domain: string}) => {
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
     * Gets all sessions from the Controller
     */
    private getAllSessions() {
        this.ccService.getAllSessions()
            .then((sessions: any[]) => {
                this.logger.log(sessions.length);
            })
            .catch(err => {
                this.logger.error('Failed to load all sessions ' + err);
            })
    }

    /**
     * Loads Service Engines
     */
    private getServiceEngines() {
        this.ccService.fetchSes()
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
            this.ccService
                .getMatchingSess(
                    httpEvent.req.socket.remoteAddress,
                    httpEvent.req.socket.remotePort,
                    httpEvent.host,
                    httpEvent.port
                )
                .then((session: session) => {
                    const se = this.serviceEngines.find((se: ServiceEngine) => {
                        return (se.ip == session.dst_ip && se.port == session.dst_port)
                    })
                    if (se) {
                        se.sendRequest(httpEvent, session);
                    } else {
                        throw new Error('Service engine returned form Controller, however not found in local DB. Serious!');
                    }
                })
                .catch((err) => {
                    this.logger.error('Error occured when getting the matching session ' + err);
                })
        });
    }

    constructor(ip: string, port: number) {
        this.ip = config.get('http.host');
        this.port = config.get('http.port');
        this.serviceEngines = [];
        this.registered = false;

        this.observeObservers();
    }
}
