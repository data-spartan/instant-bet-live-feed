import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class KafkaLoggingInterceptor implements NestInterceptor {
  // private logger = new Logger(KafkaLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToRpc().getContext();
    const topic = ctx.getTopic();
    ctx.getConsumer().logger().info(`Consumed topic: ${topic}`);
    // const request = context.switchToHttp().getRequest();

    return next.handle();
  }
}
