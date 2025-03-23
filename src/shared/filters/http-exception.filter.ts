import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

import { createGeneralExceptionError } from '../helpers/error.helper';
import { infoLog } from '../helpers/logger.helper';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    this.logError(exception, request);

    const responseError = createGeneralExceptionError(exception);

    if (Array.isArray(responseError.message)) {
      responseError.message = responseError.message.join(', ');
    } else if (
      typeof responseError.message === 'object' &&
      responseError.message !== null
    ) {
      try {
        responseError.message = JSON.stringify(responseError.message);
      } catch {
        responseError.message = 'An error occurred';
      }
    }

    response.status(responseError.statusCode).json(responseError);
  }

  private logError(exception: unknown, request: any): void {
    const method = request?.method;
    const url = request?.url;
    const context = `${method} ${url}`;

    if (exception instanceof HttpException) {
      infoLog(`${context} - ${exception.message}`, { stack: exception.stack });
    } else if (exception instanceof Error) {
      infoLog(`${context} - ${exception.message}`, { stack: exception.stack });
    } else {
      infoLog(`${context} - Unexpected error: ${JSON.stringify(exception)}`);
    }
  }
}
