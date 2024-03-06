import { Logger, Module } from '@nestjs/common';
import { LiveFeedService } from './liveFeed.service';
import { LiveFeedController } from './liveFeed.controller';
import { MongooseModule } from '@nestjs/mongoose';
// import { CreateConsumer } from 'src/kafka/createConsumer';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  DlqResolved,
  DlqResolvedSchema,
  LiveFeed,
  LiveFeedResolved,
  LiveFeedResolvedSchema,
  LiveFeedSchema,
  MongodbCollectionsEnum,
} from '@app/common';
import { RedisCacheModule } from '@app/common/redisCache/redisCache.module';
import { DatabaseModule } from '@app/common/database/database.module';
import { KafkaApiModule } from '@app/common/kafka/kafkaApi.module';
import { KafkaLoggingInterceptor } from '@app/common/interceptors/kafkaConsumer.interceptor';
import { MongooseService } from '@app/common/database/mongodb/mongoose-service/mongoose.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LiveFeed.name,
        schema: LiveFeedSchema,
        collection: MongodbCollectionsEnum.LIVE_FEED,
      },
      {
        name: LiveFeedResolved.name,
        schema: LiveFeedResolvedSchema,
        collection: MongodbCollectionsEnum.LIVE_FEED_RESOLVED,
      },
      {
        name: DlqResolved.name,
        schema: DlqResolvedSchema,
        collection: MongodbCollectionsEnum.LIVE_FEED_DLQ_RESOLVED,
      },
    ]),
    RedisCacheModule,
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
    Logger,
    LiveFeedService,
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
