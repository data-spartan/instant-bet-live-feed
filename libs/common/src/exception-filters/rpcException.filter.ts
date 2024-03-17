import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { ErrorResponse } from '../types/error.type';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: RpcException, host: ArgumentsHost) {
    if (typeof exception?.getError === 'function') {
      const { message, path, stack, statusCode } =
        exception?.getError() as ErrorResponse;
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        statusCode: status,
        message: exception.message,
        path,
      });
      Logger.error(
        JSON.stringify({
          message,
          status,
          path,
          stack: stack || '',
        }),
      );
    } else {
      Logger.error(
        JSON.stringify({
          message: exception.message,
          status: exception['status'],
          path: exception['path'] || '',
          stack:
            exception['status'] === HttpStatus.INTERNAL_SERVER_ERROR
              ? exception['stack']
              : '',
        }),
      );
    }
    return throwError(() => new RpcException(exception));
  }
}
