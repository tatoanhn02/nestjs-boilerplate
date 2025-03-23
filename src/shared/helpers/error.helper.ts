import { HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { Errors } from '../../errors/errors.constants';
import { IGeneralErrorShape } from '../../errors/errors.interface';

export function createGeneralExceptionError(
  error: unknown,
): IGeneralErrorShape {
  if (!error) {
    return Errors.UNKNOWN_ERROR;
  }

  if (error instanceof HttpException) {
    return handleHttpException(error);
  }

  if (
    Array.isArray(error) &&
    error.length > 0 &&
    error[0] instanceof ValidationError
  ) {
    return handleValidationErrors(error as ValidationError[]);
  }

  return handleGenericError(error);
}

function handleHttpException(error: HttpException): IGeneralErrorShape {
  try {
    const errorResponse = error.getResponse() as Record<string, any>;

    return {
      errors: errorResponse?.errors,
      message: errorResponse?.message || error.message,
      statusCode: error.getStatus(),
      ...(errorResponse?.errorCode && { errorCode: errorResponse.errorCode }),
      ...(errorResponse?.description && {
        description: errorResponse.description,
      }),
      ...(error?.stack && { stackTrace: error.stack }),
      ...(errorResponse?.customData && {
        customData: errorResponse?.customData,
      }),
    };
  } catch (error) {
    return {
      message: error.message,
      statusCode: error.getStatus(),
      ...(error?.stack && { stackTrace: error.stack }),
    };
  }
}

function handleValidationErrors(
  validationErrors: ValidationError[],
): IGeneralErrorShape {
  const formattedErrors = validationErrorsFormatter(validationErrors);
  const errorKeys = Object.keys(formattedErrors);

  const firstErrorMessage =
    errorKeys.length > 0 && formattedErrors[errorKeys[0]].length > 0
      ? formattedErrors[errorKeys[0]][0]
      : 'Validation failed';

  return {
    ...Errors.INTERNAL_SERVER_ERROR,
    message: firstErrorMessage,
    errors: formattedErrors,
  };
}

function handleGenericError(error: any): IGeneralErrorShape {
  const { status, message } = getErrorStatusAndMessage(error);

  return {
    ...Errors.UNKNOWN_ERROR,
    message,
    statusCode: status,
    ...(error?.stack && { stackTrace: error.stack }),
  };
}

const validationErrorsFormatter = (
  validationErrors: ValidationError[],
): Record<string, string[]> => {
  return validationErrors.reduce(
    (acc, item) => {
      acc[item.property] = Object.values(item.constraints || {});
      return acc;
    },
    {} as Record<string, string[]>,
  );
};

const getErrorStatusAndMessage = (
  error: any,
): { message: string; status: number } => {
  const status =
    error?.response?.data?.statusCode ||
    error?.response?.status ||
    error?.status ||
    Errors.UNKNOWN_ERROR.statusCode;

  let message: string =
    error.response?.data?.message ||
    (typeof error.response?.data === 'string' ? error.response.data : null) ||
    error.message ||
    Errors.UNKNOWN_ERROR.message;

  if (typeof message === 'object' && message !== null) {
    try {
      message = JSON.stringify(message);
    } catch {
      message = 'Unknown error occurred';
    }
  }

  return { message, status };
};
