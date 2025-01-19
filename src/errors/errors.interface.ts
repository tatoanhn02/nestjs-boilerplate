import { HttpStatus } from '@nestjs/common';

export type ErrorType = {
  message: string;
  statusCode: HttpStatus;
};
