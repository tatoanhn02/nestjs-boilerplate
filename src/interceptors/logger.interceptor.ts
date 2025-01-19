import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestMethod,
} from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';
import { NextFunction } from 'express';
import * as httpContext from 'express-http-context';
import { map, Observable } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

import { LOGGER_ENABLED } from '../config/config.provider';
import {
  httpRequestLog,
  httpResponseLog,
} from '../shared/helpers/logger.helper';
import { EXCLUDED_LOGGER_MIDDLEWARE_ROUTES } from './interceptors.constants';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    if (LOGGER_ENABLED) {
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();
      const res = ctx.getResponse();

      const excludedRoutes = EXCLUDED_LOGGER_MIDDLEWARE_ROUTES.some(
        (excludedRoute: RouteInfo) => {
          return (
            req.originalUrl.includes(`${excludedRoute.path}`) &&
            (excludedRoute.method === RequestMethod[req.method as string] ||
              req.method === RequestMethod.ALL)
          );
        },
      );

      if (!excludedRoutes) {
        httpRequestLog(req);

        return next.handle().pipe(
          map((data) => {
            httpResponseLog(req, res);

            return data;
          }),
        );
      }
    }

    return next.handle();
  }
}

export const setCorrelationId = (
  req: Request & { timestamp: number; correlationId: string },
  _res: Response,
  next: NextFunction,
) => {
  req.timestamp = Date.now();
  const correlationId = uuidV4();
  req.correlationId = correlationId;
  httpContext.set('correlationId', correlationId);

  next();
};

export const getCorrelationId = (): string => {
  let correlationId: string = httpContext.get('correlationId');

  if (!correlationId) {
    correlationId = uuidV4();
    httpContext.set('correlationId', correlationId);
  }
  return correlationId;
};
