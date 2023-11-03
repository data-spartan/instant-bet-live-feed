import {
  ArgumentsHost,
  ConsoleLogger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ErrorTypeObject } from 'src/interfaces/errorTypeObj.interface';

export const checkErrorType = (error: Error): ErrorTypeObject => {
  let message = 'Internal Server Error';
  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let stack = '';

  //   if (error instanceof RpcException) {
  //     ctx = argHost.getContext();
  //     if (argHost.getContext().constructor.name === 'KafkaContext') {
  //       const { topic, partition, offset } = ctx.args[0];
  //       message = `Error:${error.message}, Topic:${topic}, Partition: ${partition}, Offset: ${offset}`;
  //     }
  //   }
  if (error instanceof HttpException) {
    message = error['response']['message'] || error.message;
    //using ['response']['message'] bcs validation error msgs cant be accessed otherwise with error.message
    status = error.getStatus();
  } else {
    //assign stack only if error is not catched, bcs we need it to determine whats wrong
    stack = error.stack;
  }
  return { status, message, stack };
};
