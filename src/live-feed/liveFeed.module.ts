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
import { LiveFeed, LiveFeedSchema } from 'src/database/schemas/liveFeed.schema';
import {
  LiveFeedResolved,
  LiveFeedResolvedSchema,
} from 'src/database/schemas/liveFeedResolved.schema';
import { KafkaOptions } from 'src/interfaces/kafkaOptions.interfaces';
import { TestConsumer } from 'src/kafka/createConsumer';
import { Kafka } from 'kafkajs';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveFeed.name, schema: LiveFeedSchema },
      { name: LiveFeedResolved.name, schema: LiveFeedResolvedSchema },
    ]),
    KafkaModule,
    // ClientsModule.register([
    //   {
    //     name: 'LIVE_FEED_MICROSERVICE',
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
    //   // client: ClientKafka
    // ]),
  ],
  providers: [LiveFeedService, TestConsumer],
  controllers: [LiveFeedController],
})
export class LiveFeedModule {}
