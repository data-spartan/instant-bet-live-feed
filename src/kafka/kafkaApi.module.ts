import { Module } from '@nestjs/common';
import { KafkaErrorHandler } from 'src/kafka/kafkaErrorHandler.service';
import { KafkaProducerService } from 'src/kafka/producerKafka';

@Module({
  providers: [KafkaProducerService, KafkaErrorHandler],

  exports: [KafkaProducerService, KafkaErrorHandler],
})
export class KafkaApiModule {}
