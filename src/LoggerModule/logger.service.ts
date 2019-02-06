import * as config from 'config';
import { AutoWired, Singleton } from 'typescript-ioc';
import * as winston from 'winston';

@AutoWired
@Singleton
export class LoggerService {
    private logger: any;

    public log(msg: any) {
        this.logger.info(msg);
    }

    public info(msg: any) {
        this.logger.info(msg);
    }

    public debug(msg: any) {
        this.logger.debug(msg);
    }

    public error(msg: any) {
        this.logger.error(msg);
    }

    constructor() {
        this.logger = winston.createLogger({
            level: config.get('logging.level'),
            format: winston.format.json()
        });

        this.logger.add(
            new winston.transports.Console({
                format: winston.format.simple()
            })
        );

        if (process.env.NODE_LOGLEVEL === 'debug') {
            this.logger.level = 'debug';
            this.debug('RUNNING IN DEBUG MODE');
        }
    }
}
