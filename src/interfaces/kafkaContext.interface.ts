import { KafkaContext } from '@nestjs/microservices';
import { Consumer } from 'kafkajs';

export interface CustomKafkaContext {
  kafkaCtx: KafkaContext;
  offset: string; // Change the type to match your actual offset type
  partition: number; // Change the type to match your actual partition type
  topic: string; // Change the type to match your actual topic type
  consumer: Consumer;
}
