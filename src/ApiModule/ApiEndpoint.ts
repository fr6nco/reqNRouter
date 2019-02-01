import * as config from 'config';
import { Inject, Singleton, Container } from 'typescript-ioc';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { LoggerService } from '../LoggerModule/logger.service';

import { ControllerConnectorService } from '../ControllerEndpointConnectorModule/connector.service';

@Singleton
export class ApiEndpoint {
    @Inject
    logger: LoggerService

    private api: express.Application;
    private port: number;

    private urlPrefixList = [
        {
            module: "ControllerConnector",
            prefix: '/cc'
        }
    ]

    private ApiProviderServices = [
        Container.get(ControllerConnectorService)
    ]

    public setRouting() {
        for (const APIservice of this.ApiProviderServices) {
            const routes: express.Router = APIservice.supplyRoutes();
            const modulename: string = APIservice.getModuleName();
            for (const modpref of this.urlPrefixList) {
                if (modpref.module === modulename) {
                    this.api.use(modpref.prefix, routes);
                }
            }            
        }
    }

    constructor() {
        this.api = express();
        this.api.use(bodyParser.json());
        this.port = config.get('api.port');

        this.setRouting();

        this.api.listen(this.port, () => {
            this.logger.info(`Express server listening on port ${this.port}`);
        });
    }
}