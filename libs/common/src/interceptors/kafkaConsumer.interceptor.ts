import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class KafkaLoggingInterceptor implements NestInterceptor {
  // private logger = new Logger(KafkaLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToRpc().getContext();
    const topic = ctx.getTopic();
    ctx.getConsumer().logger().info(`Consumed topic: ${topic}`);

    return next.handle();
  }
}
