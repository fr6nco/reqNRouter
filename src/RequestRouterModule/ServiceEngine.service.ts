import { ServiceEngineStore } from './store/models';
import { Inject } from 'typescript-ioc';
import * as config from 'config';
import * as net from "net"

import { AppStore } from '../Store/store';

/**
 * Class implementation
 */
export class ServiceEngine implements ServiceEngineStore {
    name: string;
    ip: string;
    port: number;

    tcpsessions: [];

    connection_limit: number;

    @Inject
    store: AppStore

    private establishConnection() {
        const localAddress: string = config.get('http.host');

        let connectionOptions: net.TcpSocketConnectOpts = {
            host: this.ip,
            port: this.port,
            family: 4,
            localAddress: localAddress
        };

        const socket = net.createConnection(connectionOptions, () => {
            const source_port = socket.localPort;
            console.log(`Connected to Service Engine on ${localAddress}:${source_port} <->${this.ip}:${this.port}`);
            //TODO add to store
        });

        socket.on('error', (err) => {
            console.log(err);
            //TODO remove from store
        })

        socket.on('close', (hadError) => {
            console.log(hadError);
            //TODO remove from store
        });

        console.log('trying to establish connection');
    }

    private handleConnections() {
        if (this.tcpsessions.length < this.connection_limit) {
            this.establishConnection();
        }
    }

    private listenStoreEvents() {
        this.store.subscribe(() => {
            //TODO do the checks here and start a new connection if required       
        });
    }

    constructor(name: string, ip: string, port: number) {
        this.name = name;
        this.ip = ip;
        this.port = port;

        this.tcpsessions = [];
        this.connection_limit = 1;
        this.listenStoreEvents();
        this.handleConnections();
    }
}
