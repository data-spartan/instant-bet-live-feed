import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LiveFeedService } from './liveFeed.service';
import { LiveFeedController } from './liveFeed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveFeed, LiveFeedSchema } from 'src/database/schemas/liveFeed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveFeed.name, schema: LiveFeedSchema },
    ]),
    ClientsModule.register([
      {
        name: 'LIVE_FEED_MICROSERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'live-feed',
            brokers: ['localhost:9092'],
          },
          // producerOnlyMode: true,
          consumer: {
            groupId: 'live-feed-consumer',
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
