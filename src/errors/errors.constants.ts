import { HttpStatus } from '@nestjs/common';

import { ErrorType } from './errors.interface';

const BASE_ERROR_CODE = '10';
const GENERAL_GROUP_ERROR_CODE = '00';
// const THIRD_PARTY_GROUP_ERROR_CODE = '01';

export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = '000',
  BAD_REQUEST = '400',
  UNAUTHORIZED = '401',
  FORBIDDEN = '403',
  NOT_FOUND = '404',
  INTERNAL_SERVER_ERROR = '500',
}

const getErrorCode = (code: ErrorCode, group = GENERAL_GROUP_ERROR_CODE) =>
  `${BASE_ERROR_CODE}${group}${code}`;

export const Errors: Record<string, ErrorType> = {
  INTERNAL_SERVER_ERROR: {
    errorCode: getErrorCode(ErrorCode.INTERNAL_SERVER_ERROR),
    message: 'Internal server error.',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  UNAUTHORIZED: {
    errorCode: getErrorCode(ErrorCode.UNAUTHORIZED),
    message: 'Invalid email or password. Please try again.',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  UNKNOWN_ERROR: {
    errorCode: getErrorCode(ErrorCode.UNKNOWN_ERROR),
    message: 'An unknown error occurred.',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
