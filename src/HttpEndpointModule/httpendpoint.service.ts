import * as config from 'config';
import * as http from 'http';
import { AutoWired, Singleton } from 'typescript-ioc';

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
    server: http.Server;

    private openSocket() {        
        this.server = http.createServer(
            (req: http.IncomingMessage, res: http.ServerResponse) => {
                console.log(req.headers);
                console.log('HTTP Request received');
                res.end();
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

    constructor() {
        console.log('constructing');
        this.host = config.get('http.host');
        this.port = config.get('http.port');
        this.openSocket();
    }
}
