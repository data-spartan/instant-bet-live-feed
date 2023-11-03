import { Request, Response } from 'express';
import { ErrorResponse } from 'src/interfaces/errorResponse.interface';

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
