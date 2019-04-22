import * as config from 'config';
import * as http from 'http';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { Subject } from 'rxjs';
import { LoggerService } from '../LoggerModule/logger.service';
import { httpEvent } from './store/models';
import { ControllerConnectorService } from '../ControllerEndpointConnectorModule/connector.service';
import { NodeType } from '../ControllerEndpointConnectorModule/connector.service';

@AutoWired
@Singleton
export class HttpEndpointModule {
    host: string;
    port: number;
    domain: string;
    server: http.Server;

    @Inject
    logger: LoggerService;

    @Inject
    ccService: ControllerConnectorService;

    public httpEventSubject: Subject<httpEvent>;

    private openSocket() {
        this.server = http.createServer(async (req, res) => {
            const socket = req.socket;
            await this.ccService.sendRequestSize(socket.remoteAddress, socket.remotePort, socket.localAddress, socket.localPort, NodeType.rr, socket.bytesRead);

            if ('host' in req.headers && this.domain && req.headers['host'].startsWith(this.domain)) {
                this.httpEventSubject.next({
                    req: req,
                    reqSize: socket.bytesRead,
                    host: this.host,
                    port: this.port
                });            
            } else {
                this.logger.error(
                    'Request received for unknown domain. Rejecting'
                );
                this.logger.error(req.headers);
                res.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            }
        });

        this.server.listen(this.port, this.host, () => {
            this.logger.info(`listening on port ${this.port}`);
        });
    }

    public setDomain(domain: string) {
        this.domain = domain;
    }

    constructor() {
        this.host = config.get('http.host');
        this.port = config.get('http.port');

        this.httpEventSubject = new Subject<httpEvent>();

        this.openSocket();
    }
}
