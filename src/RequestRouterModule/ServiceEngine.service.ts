
/**
 * Class implementation
 */
export class ServiceEngine {
    name: string;
    ip: string;
    port: number;

    constructor(name: string, ip: string, port: number) {
        this.name = name;
        this.ip = ip;
        this.port = port;
    }
}

