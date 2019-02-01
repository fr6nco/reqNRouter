import * as express from 'express';

export interface ApiProvider {
    moduleName: string;
    supplyRoutes(): express.Router;
    getModuleName(): string;
}