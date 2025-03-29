import pino from 'pino';

import { LOGGER_ENABLED, pinoConfig } from '../../config/config.provider';
import { getCorrelationId } from '../../interceptors/logger.interceptor';
import { tryParseJsonString } from './data.helper';

enum LogLevel {
  FATAL = 'FATAL',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
}

const logger = pino(pinoConfig);

const logMethods = {
  [LogLevel.FATAL]: logger.fatal.bind(logger),
  [LogLevel.ERROR]: logger.error.bind(logger),
  [LogLevel.WARN]: logger.warn.bind(logger),
  [LogLevel.INFO]: logger.info.bind(logger),
  [LogLevel.DEBUG]: logger.debug.bind(logger),
  [LogLevel.TRACE]: logger.trace.bind(logger),
};

interface LogDetails {
  message?: string;
  data?: any;
  methodName?: string;
}

const log = (logLevel: LogLevel, { data, message, methodName }: LogDetails) => {
  if (!LOGGER_ENABLED) return;

  const logFunc = logMethods[logLevel];
  if (!logFunc) {
    logger.fatal({ level: logLevel }, 'Invalid log level specified');
    return;
  }

  const correlationId = getCorrelationId();

  const correlationIdMsg = '';
  const methodNameMsg = methodName ? `[${methodName}]` : '';
  const messageLog = `${correlationIdMsg}${methodNameMsg}${message ? `: ${message}` : ''}`;

  logFunc({ ...data, correlationId }, messageLog);
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

export const httpRequestLog = (req): void => {
  if (!LOGGER_ENABLED) return;

  const requestData = {
    correlationId: req.correlationId,
    method: req.method,
    originalUri: req.originalUrl,
    uri: req.url,
    clientIP: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    body: tryParseJsonString(req.body),
    headers: req.headers,
    timestamp: req.timestamp || Date.now(),
  };

  log(LogLevel.DEBUG, {
    message: 'HTTP Request',
    data: requestData,
  });
};

export const httpResponseLog = (req, res): void => {
  if (!LOGGER_ENABLED) return;

  const startTime = req.timestamp || Date.now();
  const chunks: Buffer[] = [];

  // Set response headers
  const correlationId = req.correlationId || getCorrelationId();
  res.setHeader('x-request-id', correlationId);

  // Save original methods
  const originalWrite = res.write;
  const originalEnd = res.end;

  // Override write to capture response body
  res.write = function (...args: any[]): boolean {
    if (args[0]) {
      chunks.push(Buffer.from(args[0]));
    }
    return originalWrite.apply(res, args);
  };

  // Override end to log response
  res.end = function (...args: any[]): void {
    // Capture final chunk if exists
    if (args[0]) {
      chunks.push(Buffer.from(args[0]));
    }

    const endTime = Date.now();
    const processTime = `${endTime - startTime}ms`;
    res.setHeader('x-process-time', processTime);

    // Reconstruct body
    let responseBody = '';
    try {
      responseBody = Buffer.concat(chunks).toString('utf8');
      responseBody = tryParseJsonString(responseBody);
    } catch (err) {
      responseBody = `[Error parsing response body] ${err}`;
    }

    // Log response details
    const responseData = {
      correlationId,
      statusCode: res.statusCode,
      method: req.method,
      originalUri: req.originalUrl,
      uri: req.url,
      processTime,
      responseTime: endTime - startTime,
      responseHeaders: res.getHeaders(),
      responseBody: shouldLogResponseBody(req, res)
        ? responseBody
        : '[BODY OMITTED]',
    };

    log(LogLevel.DEBUG, {
      message: `HTTP Response - ${processTime}`,
      data: responseData,
    });

    // Call original end method
    originalEnd.apply(res, args);
  };
};

function shouldLogResponseBody(req, res): boolean {
  const contentType = String(res.getHeader('content-type') || '');

  // Don't log binary content
  if (
    contentType.includes('image/') ||
    contentType.includes('audio/') ||
    contentType.includes('video/') ||
    contentType.includes('application/octet-stream')
  ) {
    return false;
  }

  // Skip large responses to avoid bloating logs
  const contentLength = Number(res.getHeader('content-length') || 0);
  if (contentLength > 10240) {
    // Skip if > 10KB
    return false;
  }

  return true;
}
