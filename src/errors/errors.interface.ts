import { HttpStatus } from '@nestjs/common';

export type ErrorType = {
  message: string;
  statusCode: HttpStatus;
  errorCode: string;
};

export interface IGeneralErrorShape {
  name?: string;
  message: string;
  errorCode?: string;
  description?: string;
  statusCode: HttpStatus;
  customData?: Record<string, unknown>;

  stackTrace?: string;
  logData?: unknown;
  errors?: Record<string, string[]> | unknown;
}
