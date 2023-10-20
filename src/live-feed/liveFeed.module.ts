import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LiveFeedService } from './liveFeed.service';
import { LiveFeedController } from './liveFeed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveFeed, LiveFeedSchema } from 'src/database/schemas/liveFeed.schema';
import {
  LiveFeedResolved,
  LiveFeedResolvedSchema,
} from 'src/database/schemas/liveFeedResolved.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveFeed.name, schema: LiveFeedSchema },
      { name: LiveFeedResolved.name, schema: LiveFeedResolvedSchema },
    ]),
    ClientsModule.register([
      {
        name: 'LIVE_FEED_MICROSERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'live-feed',
            brokers: ['localhost:9092', 'localhost:9093'],
          },
          // producerOnlyMode: true,
          consumer: {
            groupId: 'live-feed-consumer',
            allowAutoTopicCreation: false,
          },
        },
      },
    ]),
  ],
  providers: [LiveFeedService],
  controllers: [LiveFeedController],
  // exports: [LiveFeedController],
})
export class LiveFeedModule {}
