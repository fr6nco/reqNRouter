import { ServiceEngine } from './ServiceEngine.service';
import { Inject } from 'typescript-ioc';
import { ControllerConnectorService } from '../ControllerEndpointConnectorModule/connector.service';
import { ControllerConnectorStore } from '../ControllerEndpointConnectorModule/store/models';
import { ServiceEngineStore, session } from './store/models';
import * as net from "net"
import {
    HttpEndpointModule,
    httpEvent
} from '../HttpEndpointModule/httpendpoint.service';

/**
 * Consider making this a singleton
 */
export class RequestRouter {
    name: string;
    ip: string;
    port: number;
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
            .then((name: string) => {
                this.registered = true;
                this.name = name;

                if (!this.lastFetched) {
                    this.loadSe();
                }
            })
            .catch(err => {
                console.error('Failed to register ', err);
                this.registered = false;
                this.name = '';
            });
    }

    private loadSe() {
        this.ccService
            .fetchSes()
            .then((ses: ServiceEngineStore[]) => {
                ses.forEach(se => {
                    const seInstance = new ServiceEngine(
                        se.name,
                        se.ip,
                        se.port
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
                    console.log('YAAAAW the matching session will be ', session.src_ip, session.src_port, session.dst_ip, session.dst_port);

                    this.serviceEngines.forEach((se: ServiceEngine) => {
                        if (se.ip == session.dst_ip && se.port == session.dst_port) {
                            se.sendRequest(httpEvent, session);
                        }
                    });
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

        console.log(this.httpServer.port);
    }
}
