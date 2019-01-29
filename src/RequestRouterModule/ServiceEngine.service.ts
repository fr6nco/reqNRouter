import { httpEvent } from '../HttpEndpointModule/httpendpoint.service'
import { ServiceEngineStore, session } from './store/models';
import * as config from 'config';
import * as net from "net"
import * as http from "http";

/**
 * Class implementation
 */
export class ServiceEngine implements ServiceEngineStore {
    name: string;
    ip: string;
    port: number;
    domain: string;

    tcpsessions: net.Socket[];
    agent: http.Agent;

    connection_limit: number;

    private establishConnection() {
        const localAddress: string = config.get('http.host');

        let connectionOptions: net.TcpSocketConnectOpts = {
            host: this.ip,
            port: this.port,
            family: 4,
            localAddress: localAddress
        };

        const socket: net.Socket = net.createConnection(connectionOptions, () => {
            const source_port = socket.localPort;
            // console.log(`Connected to Service Engine on ${localAddress}:${source_port}<->${this.ip}:${this.port}`);
            this.handleConnections();
        });

        this.tcpsessions.push(socket);

        socket.on('close', (hadError) => {
            this.tcpsessions = this.tcpsessions.filter((conn) => conn != socket);
            this.handleConnections();
        });
    }

    public stopConenctions() {
        this.tcpsessions.forEach((conn) => {
            conn.destroy();
        });
        this.tcpsessions = [];
    }

    private handleConnections() {
        if (this.tcpsessions.length < this.connection_limit) {
            this.establishConnection();
        }
    }

    public sendRequest(httpEvent: httpEvent, session: session) {
        const sess: net.Socket = this.tcpsessions.find((sess: net.Socket) => {
            return (sess.localAddress == session.src_ip && sess.localPort == session.src_port)
        });

        if (sess) {
            const host = this.port === 80 ? this.domain : `${this.domain}:${this.port}`;
            const headers = {
                ...httpEvent.req.headers,
                host: host
            }
            // console.log(`Rewriting headers FROM:`);
            // console.log(httpEvent.req.headers);
            // console.log(`TO:`);
            // console.log(headers);

            const request = http.request({
                method: httpEvent.req.method,
                headers: headers,
                path: httpEvent.req.url,
                createConnection: () => { return sess; }
            });
            request.on('error', (err: Error) => {
                //TODO handle stats here
            });

            request.end(() => {
                console.log('request sent');
            });
        } else {
            console.error(`TCP Session not existing towards SE ${session}`);
        }
    }

    constructor(name: string, ip: string, port: number, domain: string) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.agent = new http.Agent({keepAlive: true});
        this.domain = domain;

        this.tcpsessions = [];
        this.connection_limit = config.get('request_router.se_connection_limit');
        this.handleConnections();
    }
}
