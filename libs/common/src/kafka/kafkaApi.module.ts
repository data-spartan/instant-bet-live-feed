import { Module } from '@nestjs/common';
import { KafkaProducerService } from './producerKafka';
import { KafkaErrorHandler } from './kafkaErrorHandler.service';

@Module({
  providers: [KafkaProducerService, KafkaErrorHandler],

  exports: [KafkaProducerService, KafkaErrorHandler],
})
export class KafkaApiModule {}
