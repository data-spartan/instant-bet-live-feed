import { ErrorResponse } from '@app/common/types/error.type';

export const GlobalResponseError: (
  statusCode: number,
  message: string,
  path: string,
  method: string,
  stack: string | void,
) => ErrorResponse = (
  statusCode: number,
  message: string,
  path: string,
  method: string,
  stack: string | void,
): ErrorResponse => {
  return {
    statusCode,
    message,
    path,
    method,
    stack,
  };
};
