import pino from 'pino';

import { PINO_ENABLED, pinoConfig } from '../../config/config.provider';
import { getCorrelationId } from '../../interceptors/logger.interceptor';
import { tryParseJsonString } from './data.helper';

enum LogLevel {
  ERROR = 'ERROR',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

const logger = pino(pinoConfig);

const logLevelFunc = {
  [LogLevel.ERROR]: logger.error,
  [LogLevel.INFO]: logger.info,
  [LogLevel.DEBUG]: logger.debug,
};

type LogDetails = {
  message?: string;
  data?;
  methodName?: string;
};

const log = (logLevel: LogLevel, { data, message, methodName }: LogDetails) => {
  if (!PINO_ENABLED) return;

  const logFunc = logLevelFunc[logLevel];
  if (!logFunc) {
    logger.fatal({}, `No log func for level ${logLevel}`);
    return;
  }

  const correlationId = getCorrelationId();
  const correlationIdMsg = correlationId ? `[${correlationId}]` : '';
  const methodNameMsg = methodName ? `[${methodName}]` : '';
  const messageLog = correlationIdMsg + methodNameMsg + `: ${message}`;

  logFunc.call(logger, { ...data, correlationId }, { message: messageLog });
};

export const infoLog = (
  message?: string,
  data?: any,
  methodName?: string,
): void => {
  log(LogLevel.INFO, { message, data, methodName });
};

export const errorLog = (
  message?: string,
  data?: any,
  methodName?: string,
): void => {
  log(LogLevel.ERROR, { message, data, methodName });
};

export const httpRequestLog = (req) => {
  const requestLog = {
    correlationId: req.correlationId,
    message: `HTTP Request`,
    data: {
      // clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      method: req.method,
      originalUri: req.originalUrl,
      uri: req.url,
      // referer: req.headers.referer || '',
      // userAgent: req.headers['user-agent'],
      req: {
        body: tryParseJsonString(req.body),
        headers: req.headers,
      },
    },
  };
  log(LogLevel.DEBUG, requestLog);
};

export const httpResponseLog = (req, res) => {
  const elapsedStart = req.timestamp ? req.timestamp : 0;
  const elapsedEnd = Date.now();
  const processTime = `${elapsedStart > 0 ? elapsedEnd - elapsedStart : 0}ms`;
  res.setHeader('x-request-id', req.correlationId);
  res.setHeader('x-process-time', processTime);
  const rawResponse = res.write;
  const rawResponseEnd = res.end;
  const chunks = [];
  res.write = (...args) => {
    const restArgs = [];
    for (let i = 0; i < args.length; i++) {
      restArgs[i] = args[i];
    }
    chunks.push(Buffer.from(restArgs[0]));
    rawResponse.apply(res, restArgs);
  };
  res.end = (...args) => {
    const restArgs = [];
    for (let i = 0; i < args.length; i++) {
      restArgs[i] = args[i];
    }
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    const responseLog = {
      timestamp: new Date(elapsedEnd).toISOString(),
      correlationId: req.correlationId,
      level: LogLevel.DEBUG,
      message: `HTTP Response - ${processTime}`,
      data: {
        req: {
          body: req.body,
          headers: req.headers,
        },
        res: {
          body: tryParseJsonString(body),
          headers: res.getHeaders(),
        },
        statusCode: res.statusCode,
        // clientIP:
        //   req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        method: req.method,
        originalUri: req.originalUrl,
        uri: req.url,
        // referer: req.headers.referer || '',
        // userAgent: req.headers['user-agent'],
        processTime,
      },
    };
    log(LogLevel.DEBUG, responseLog);
    rawResponseEnd.apply(res, restArgs);
  };
};
