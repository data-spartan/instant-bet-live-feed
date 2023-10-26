import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { KafkaRetriableException, ServerKafka } from '@nestjs/microservices';
import {
  KafkaJSNonRetriableError,
  KafkaJSNumberOfRetriesExceeded,
} from '@nestjs/microservices/external/kafka.interface';

@Catch(KafkaRetriableException)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    console.log(exception.message, 'DJOKA');
  }
}
