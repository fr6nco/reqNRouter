import { ServiceEngine } from './ServiceEngine.service';
import { Inject } from 'typescript-ioc';
import { ControllerConnectorService } from '../ControllerEndpointConnectorModule/connector.service';
import { ControllerConnectorStore } from '../ControllerEndpointConnectorModule/store/models';
import { ServiceEngineStore, RequestRouterStore, session } from './store/models';
import {
    HttpEndpointModule,
    httpEvent
} from '../HttpEndpointModule/httpendpoint.service';

/**
 * Consider making this a singleton
 */
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

    private register() {
        this.ccService
            .registerRR(this.ip, this.port)
            .then((data:{ name: string; domain: string}) => {
                this.registered = true;
                this.name = data.name;
                this.domain = data.domain;
                this.httpServer.setDomain(this.domain);
                
                if (!this.lastFetched) {
                    this.loadSe();
                }

                // console.log('Starting interval polling to check all sessions');
                // let timer = setInterval(() => {
                //     this.getAllSessions();
                // }, 10000);
            })
            .catch(err => {
                console.error('Failed to register ', err);
                this.registered = false;
                this.name = '';
            });
    }

    private getAllSessions() {
        this.ccService.getAllSessions()
            .then((sessions: any[]) => {
                console.log(sessions.length);
            })
            .catch(err => {
                console.error('Failed to load all sessions ', err);
            })
    }

    private loadSe() {
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
                console.error('Failed to load ses ', err);
            });
    }

    private stopSe() {
        this.serviceEngines.forEach(se => {
            se.stopConenctions();
        });
        this.serviceEngines = [];
    }

    private observeObservers() {
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
                    console.error('Error occured when getting the matching session ', err);
                })
        });
    }

    constructor(ip: string, port: number) {
        this.ip = ip;
        this.port = port;
        this.serviceEngines = [];
        this.registered = false;

        this.observeObservers();
    }
}
