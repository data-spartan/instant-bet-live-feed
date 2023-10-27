import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class CatchExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // console.log(context.switchToRpc().getContext().args[0][0]);

    return next
      .handle()
      .pipe(
        catchError((err) => throwError(() => new BadRequestException(err))),
      );
  }
}
