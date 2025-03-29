import { MongooseModuleOptions } from '@nestjs/mongoose';
import config from 'config';
import * as fs from 'fs';
import ms from 'ms';
import * as path from 'path';
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

export const LOGGER_ENABLED: boolean = config.get('logger.enabled');

export const USER_MAX_FAILED_ATTEMPTS: number = +config.get(
  'user.maxFailedAttempts',
);
export const USER_LOCK_DURATION_MINUTES: number = +config.get(
  'user.lockDurationMinutes',
);

export const JWT_EXPIRES_IN: ms.StringValue = config.get('jwt.expiresIn');
export const JWT_SECRET: string = config.get('jwt.secret');
export const JWT_REFRESH_EXPIRES_IN: ms.StringValue = config.get(
  'jwt.refreshExpiresIn',
);
export const JWT_REFRESH_SECRET: string = config.get('jwt.refreshSecret');
export const JWT_FORGOT_SECRET: string = config.get('jwt.forgotSecret');

export const USER_INITIAL_EMAIL: string = config.get('user.initialEmail');
export const USER_INITIAL_PASSWORD: string = config.get('user.initialPassword');
export const USER_INITIAL_ROLE: string = config.get('user.initialRole');

export const REDIS: Record<string, unknown> = config.get('redis');
export const REDIS_HOST: string = config.get('redis.host');
export const REDIS_PORT: number = +config.get('redis.port');
export const REDIS_QUEUE_USERS: string = config.get('redis.redisQueueUsers');

export const MAILER_HOST: string = config.get('mailer.host');
export const MAILER_PORT: number = +config.get('mailer.port');
export const MAILER_IGNORE_TLS: boolean = config.get('mailer.ignoreTLS');
export const MAILER_REQUIRE_TLS: boolean = config.get('mailer.requireTLS');
export const MAILER_SECURE: boolean = config.get('mailer.secure');

export const AWS_ACCESS_KEY: string = config.get('aws.accessKey');
export const AWS_SECRET_KEY: string = config.get('aws.secretAccessKey');
export const AWS_S3_REGION: string = config.get('aws.s3Region');
export const AWS_S3_BUCKET: string = config.get('aws.s3bucket');

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFileName = path.join(
  logsDir,
  `app-${new Date().toISOString().split('T')[0]}.log`,
);

export const pinoConfig: LoggerOptions = {
  enabled: LOGGER_ENABLED,
  level: config.get('logger.level'),
  redact: {
    ...config.get('logger.redact'),
    paths:
      config.get<boolean>('logger.redact.enabled') &&
      config.get<string[]>('logger.redact.paths')
        ? config.get('logger.redact.paths')
        : [],
  },
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: {
          destination: logFileName,
          mkdir: true,
        },
      },
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname,correlationId',
        },
      },
    ],
  },
};

export const getMongooseConfig = (): MongooseModuleOptions => ({
  uri: config.get('mongodb.uri'),
});
