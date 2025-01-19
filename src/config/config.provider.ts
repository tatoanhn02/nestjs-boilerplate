import { MongooseModuleOptions } from '@nestjs/mongoose';
import * as config from 'config';
import { LoggerOptions } from 'pino';

import { ConfigType } from './config.interface';

export const getConfig = (): ConfigType => {
  return;
};

export const SERVICE_NAME: string = config.get('service.name');
export const HOST_NAME: string = config.get('server.hostname');
export const SERVICE_BASE_URL: string = config.get('service.baseUrl');
export const SERVICE_DOCS_BASE_URL: string = config.get('service.docsBaseUrl');
export const SERVER_PORT: number = +config.get('server.port');

export const PINO_ENABLED: boolean = config.get('pino.enabled');

export const LOGGER_ENABLED: boolean = config.get('logger.enabled');

export const pinoConfig: LoggerOptions = {
  enabled: PINO_ENABLED,
  level: config.get('pino.level'),
  redact: {
    ...config.get('pino.redact'),
    paths:
      config.get<boolean>('pino.redact.enabled') &&
      config.get<string[]>('pino.redact.paths')
        ? config.get('pino.redact.paths')
        : [],
  },
};

export const getMongooseConfig = (): MongooseModuleOptions => ({
  uri: config.get('mongodb.uri'),
});
