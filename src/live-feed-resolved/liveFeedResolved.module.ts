import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LiveFeedResolvedService } from './liveFeedResolved.service';
import { LiveFeedResolvedController } from './liveFeedResolved.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveFeed, LiveFeedSchema } from 'src/database/schemas/liveFeed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveFeed.name, schema: LiveFeedSchema },
    ]),
    ClientsModule.register([
      {
        name: 'LIVE_FEED_RESOLVED_MICROSERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'live-feed-resolved',
            brokers: ['localhost:9092'],
          },
          // subscribe: {
          //   topics: ['live_feed_resolved'],
          //   fromBeginning: true,
          // },
          // producerOnlyMode: true,
          consumer: {
            groupId: 'live-feed-consumer',
          },
        },
      },
    ]),
  ],
  providers: [LiveFeedResolvedService],
  controllers: [LiveFeedResolvedController],
  // exports: [LiveFeedController],
})
export class LiveFeedResolvedModule {}
