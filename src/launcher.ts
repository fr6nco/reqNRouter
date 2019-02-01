import { LoggerService } from "./LoggerModule/logger.service";
import { Inject, Container, Singleton, AutoWired } from 'typescript-ioc';

import { HttpEndpointModule } from './HttpEndpointModule/httpendpoint.service';
import { ControllerConnectorService } from './ControllerEndpointConnectorModule/connector.service';
import { ApiEndpoint } from './ApiModule/ApiEndpoint';
import { RequestRouter } from './RequestRouterModule/RequestRouter.service';
import "reflect-metadata";

@Singleton
@AutoWired
export class RequestRouterLauncher {
    @Inject
    private logger: LoggerService

    private services = [
        Container.get(HttpEndpointModule),
        Container.get(ApiEndpoint),
        Container.get(ControllerConnectorService),
        Container.get(RequestRouter)
    ]
    
    public async run(): Promise<void> {
        try {
            this.logger.debug("beginning server bootstrap");
            for (const service of this.services) {
                if ("initialize" in service) {
                    await service.initialize();
                }
            }
        } catch (error) {
            this.logger.error("server startup failed: " + error.message || "unknown error while initializing services");
            this.logger.error(error);
            process.exit(1);
        }
    }
}