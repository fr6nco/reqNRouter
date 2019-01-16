import * as config from 'config';
import * as http from 'http';
import { AutoWired, Singleton } from 'typescript-ioc';
import { Subject } from 'rxjs';

export interface httpEvent {
    req: http.IncomingMessage,
    host: string,
    port: number
}

@AutoWired
@Singleton
export class HttpEndpointModule {
    /**
     *   "http": {
     *       "host": "10.10.0.5",
     *       "port": 8082
     *   },
     */

    host: string;
    port: number;
    domain: string;
    server: http.Server;

    public httpEventSubject: Subject<httpEvent>;

    private openSocket() {   
        this.server = http.createServer(
            (req: http.IncomingMessage, res: http.ServerResponse) => {
                if('host' in req.headers && this.domain && req.headers['host'].startsWith(this.domain)) {
                    console.log('incoming request');
                    console.log(req.socket.remoteAddress);
                    console.log(req.socket.remotePort);
                    this.httpEventSubject.next({
                        req: req,
                        host: this.host,
                        port: this.port
                    });
                    console.log('incoming request');

                    //TODO Once handover is done, remove this line
                } else {
                    console.log('Request received for unknown domain. Rejecting');
                    console.log(req.headers);
                    res.end('HTTP/1.1 400 Bad Request\r\n\r\n');
                }
            }
        );

        this.server.on('clientError', (err, socket) => {
            console.error(err);
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        this.server.on('error', (err: Error) => {
            console.error(err);
        });

        this.server.listen(this.port, this.host, () => {
            console.log(`listening on port ${this.port}`);
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
