import { ControllerConnectorService } from './ControllerEndpointConnectorModule/connector.service';
import { RequestRouter } from './RequestRouterModule/RequestRouter.service';
import * as config from 'config';

const rr = new RequestRouter(config.get('http.host'), config.get('http.port'));
