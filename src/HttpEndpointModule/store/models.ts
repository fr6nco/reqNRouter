import * as http from 'http';

export interface httpEvent {
    req: http.IncomingMessage,
    host: string,
    port: number
}