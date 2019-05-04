import { httpEvent } from '../HttpEndpointModule/store/models';
import { ServiceEngineStore, session } from './store/models';
import { LoggerService } from '../LoggerModule/logger.service';
import { Inject } from 'typescript-ioc';
import * as config from 'config';
import * as net from "net"
import * as http from "http";
import { ControllerConnectorService, NodeType } from '../ControllerEndpointConnectorModule/connector.service';

/**
 * Class implementation
 */
export class ServiceEngine implements ServiceEngineStore {
    name: string;
    ip: string;
    port: number;
    domain: string;

    tcpsessions: net.Socket[];

    @Inject
    logger: LoggerService;

    @Inject
    ccService: ControllerConnectorService

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
            this.logger.debug(`TCP Socket connected to Service Engine: ${localAddress}:${socket.localPort}<->${this.ip}:${this.port}`);
            this.handleConnections();
        });
        this.logger.debug(`Trying to establish a new connection`);

        this.tcpsessions.push(socket);

        socket.on('close', (hadError) => {
            this.tcpsessions = this.tcpsessions.filter((conn) => conn != socket);
            this.logger.debug(`TCP socket disconnected: ${localAddress}<->${this.ip}:${this.port}`);
            if(hadError) {
                this.logger.debug(`Disconnected with ERROR`);
            }
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

    public async sendRequest(httpEvent: httpEvent, session: session) {
        //Find session
        const sess: net.Socket = this.tcpsessions.find((sess: net.Socket) => {
            return (sess.localAddress == session.src_ip && sess.localPort == session.src_port)
        });

        if (sess) {
            //Prepare host and rewrite it in headers
            //This is a very ugly was of calculating the difference between the two request sizes.. I'm not proud of it
            const host = this.port === 80 ? this.domain : `${this.domain}:${this.port}`;
            const hostdiff = host.length - httpEvent.req.headers.host.length;
            // const connheader = "Connection: close\r\n";
            const newrequestSize = httpEvent.reqSize + hostdiff; // + connheader.length;
            this.logger.debug(`New request size will be ${newrequestSize}`);

            //We want to wait for this, otherwise handover wont work
            await this.ccService.sendRequestSize(sess.localAddress, sess.localPort, sess.remoteAddress, sess.remotePort, NodeType.se, newrequestSize);

            const headers = {
                ...httpEvent.req.headers,
                host: host
            }

            //Prepare request
            const request = http.request({
                method: httpEvent.req.method,
                headers: headers,
                path: httpEvent.req.url,
                createConnection: () => { return sess; }
            });

            request.setSocketKeepAlive(true);

            request.on('error', (err: Error) => {
                this.logger.debug(`Request Error occured: ${err}`)
            });

            this.logger.debug(`Sending Request to Service engine on ${sess.localAddress}:${sess.localPort}<->${this.ip}:${this.port}`);
            this.logger.debug(`Rewriting host from ${httpEvent.req.headers.host} to ${headers.host}`);

            request.write("", (err: Error) => {
                if (err) {
                    this.logger.error(err);
                } else {
                    this.logger.info('Written');
                }
            });

            // //Send request
            // request.end(() => {
            //     this.logger.debug(`Request sent`);
            //     this.logger.debug(`SENT bytes: ${sess.bytesWritten}`)
            // });
        } else {
            this.logger.error(`TCP Session not existing towards SE ${session}`);
        }
    }

    constructor(name: string, ip: string, port: number, domain: string) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.domain = domain;

        this.tcpsessions = [];
        this.connection_limit = config.get('request_router.se_connection_limit');
        this.handleConnections();
    }
}
