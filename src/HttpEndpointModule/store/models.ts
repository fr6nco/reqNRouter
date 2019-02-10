import * as http from 'http';

export interface httpEvent {
    req: http.IncomingMessage,
    reqSize: number,
    host: string,
    port: number
}