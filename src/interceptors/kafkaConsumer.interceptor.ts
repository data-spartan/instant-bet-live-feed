// import {
//   BadRequestException,
//   CallHandler,
//   ExecutionContext,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// import { RpcException } from '@nestjs/microservices';
// import { Observable, catchError, throwError } from 'rxjs';

// @Injectable()
// export class CatchExceptionInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): any {
//     //     return next
//     //       .handle()
//     //       .pipe(catchError((err) => throwError(() => new RpcException(err))));
//     //   }
//   }
// }

import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Console } from 'console';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CatchExceptionInterceptor implements NestInterceptor {
  // private logger = new Logger(KafkaLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const request = context.switchToRpc().getData();

    // console.log(request[0]);

    return next.handle().pipe(
      map(() => {
        const response = context.switchToHttp();
        console.log(response.getResponse());
        return response;
      }),
    );
  }
}
