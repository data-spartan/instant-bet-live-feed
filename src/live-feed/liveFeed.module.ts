import { Module } from '@nestjs/common';
import {
  Client,
  ClientKafka,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { LiveFeedService } from './liveFeed.service';
import { LiveFeedController } from './liveFeed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LiveFeed,
  LiveFeedSchema,
} from 'src/database/mongodb/schemas/liveFeed.schema';
import {
  LiveFeedResolved,
  LiveFeedResolvedSchema,
} from 'src/database/mongodb/schemas/liveFeedResolved.schema';
import { KafkaOptions } from 'src/interfaces/kafkaOptions.interface';
// import { CreateConsumer } from 'src/kafka/createConsumer';
import { Kafka } from 'kafkajs';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  DlqResolved,
  DlqResolvedSchema,
} from 'src/database/mongodb/schemas/dlqResolved.schema';
import { MongooseQueries } from 'src/database/mongodb/queries/liveFeedService.queries';
import { KafkaErrorHandler } from 'src/kafka/kafkaErrorHandler.service';
import { KafkaProducerService } from 'src/kafka/producerKafka';
import { KafkaLoggingInterceptor } from 'src/interceptors/kafkaConsumer.interceptor';
import { MongooseService } from 'src/database/mongodb/mongoose-service/mongoose.service';
import { DatabaseModule } from 'src/database/database.module';
import { KafkaApiModule } from 'src/kafka/kafkaApi.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveFeed.name, schema: LiveFeedSchema, collection: 'livefeed' },
      {
        name: LiveFeedResolved.name,
        schema: LiveFeedResolvedSchema,
        collection: 'livefeed.resolved',
      },
      {
        name: DlqResolved.name,
        schema: DlqResolvedSchema,
        collection: 'dlq.resolved',
      },
    ]),
    DatabaseModule,
    KafkaApiModule,
    // ClientsModule.register([
    //   {
    //     name: 'LIVE_FEED',
    //     transport: Transport.KAFKA,
    //     options: {
    //       client: {
    //         brokers: ['localhost:9092', 'localhost:9093'],
    //       },

    //       // producerOnlyMode: true,
    //       consumer: {
    //         groupId: 'live-feed-consumer',
    //         allowAutoTopicCreation: false,
    //       },
    //     },
    //   },
    // ]),
  ],
  providers: [
    LiveFeedService,
    // MongooseQueries,
    // KafkaProducerService,
    // KafkaErrorHandler,
    MongooseService,
    {
      provide: APP_INTERCEPTOR,
      useClass: KafkaLoggingInterceptor,
    },
  ],
  controllers: [LiveFeedController],
  // exports: [LiveFeedService],
})
export class LiveFeedModule {}
