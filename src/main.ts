import { Container } from 'typescript-ioc';
import { RequestRouterLauncher } from './launcher';

const launcher = Container.get(RequestRouterLauncher);
launcher.run();