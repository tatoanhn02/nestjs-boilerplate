import { HttpStatus } from '@nestjs/common';

import { ErrorType } from './errors.interface';

export const Errors: Record<string, ErrorType> = {
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error.',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  UNAUTHORIZED: {
    message: 'Invalid email or password. Please try again.',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
};
