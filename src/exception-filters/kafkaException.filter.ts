import {
  ArgumentsHost,
  Catch,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class KafkaExceptionFilter implements RpcExceptionFilter<RpcException> {
  // private readonly logger = new Logger(KafkaExceptionFilter.name);
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const adapter = host.switchToRpc().getContext();
    // console.log(adapter);
    // console.log('TEST', exception);
    throw exception.getError();
  }
}
// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
// } from '@nestjs/common';
// import { KafkaContext, RpcException } from '@nestjs/microservices';
// import { throwError } from 'rxjs';

// @Catch(HttpException)
// export class KafkaExceptionFilter implements ExceptionFilter {
//   async catch(exception: HttpException, host: ArgumentsHost) {
//     const hostType = host.getType(); // 'rpc'
//     const context = host.switchToRpc().getContext<KafkaContext>();
//     console.log('CARINA');
//     return throwError(() => new RpcException(exception));
//   }
// }
