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
            console.log(`Connected to Service Engine on ${localAddress}:${source_port} <->${this.ip}:${this.port}`);
        });

        this.tcpsessions.push(socket);

        socket.on('error', (err) => {
            console.log(err);
        })

        socket.on('close', (hadError) => {
            console.log('TCP session disconnected. Haderror?: ', hadError);
            this.tcpsessions = this.tcpsessions.filter((conn) => conn != socket);
            this.handleConnections();
        });

        console.log('trying to establish connection');
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
        this.tcpsessions.forEach((sess: net.Socket) => {
            if (sess.localAddress == session.src_ip && sess.localPort == session.src_port) {
                console.log(httpEvent.req.headers);

                // TODO build host here correct Host here
                const headers = {
                    ...httpEvent.req.headers,
                    host: session.dst_ip
                }
                const request = http.request({
                    method: 'GET',
                    headers: headers,
                    path: '/',
                    createConnection: () => { return sess; }
                });
                request.end();
            }
        });
    }

    constructor(name: string, ip: string, port: number) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.agent = new http.Agent({keepAlive: true});

        this.tcpsessions = [];
        this.connection_limit = 1;
        this.handleConnections();
    }
}
