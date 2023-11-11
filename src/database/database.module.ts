import { Module } from '@nestjs/common';
import { MongooseService } from './mongodb/mongoose-service/mongoose.service';
import { MongooseQueries } from './mongodb/queries/liveFeedService.queries';
import { KafkaErrorHandler } from 'src/kafka/kafkaErrorHandler.service';
import { KafkaProducerService } from 'src/kafka/producerKafka';
import { KafkaApiModule } from 'src/kafka/kafkaApi.module';

@Module({
  imports: [KafkaApiModule],
  providers: [
    MongooseService,
    MongooseQueries,
    // KafkaProducerService,
    // KafkaErrorHandler,
  ],

  exports: [
    MongooseService,
    MongooseQueries,
    // KafkaProducerService,
    // KafkaErrorHandler,
  ],
})
export class DatabaseModule {}
