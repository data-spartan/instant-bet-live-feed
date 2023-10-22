import { Controller, Get, Inject } from '@nestjs/common';
import { LiveFeedService } from './liveFeed.service';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
  MessageHandler,
} from '@nestjs/microservices';
import { SubscribeTo } from 'src/kafka/kafka.decorator';

@Controller('feed')
export class LiveFeedController {
  constructor(
    private readonly liveFeedService: LiveFeedService, // @Inject('LIVE_FEED_MICROSERVICE') private readonly liveFeed: ClientKafka,
  ) {}

  @SubscribeTo('live_feed')
  async liveData(@Payload() data) {
    console.log('STEFAN', data[0]);
    console.log(this.liveFeedService);
    // this.liveFeedService.insertFeed(data);
  }

  @SubscribeTo('live_resolved')
  async liveResolved(@Payload() data, @Ctx() context: KafkaContext) {
    const toResolveTickets = await this.liveFeedService.insertResolved(data);
    if (toResolveTickets)
      // this.liveFeed.emit('resolve_tickets', toResolveTickets);
      null;
  }

  @EventPattern('resolve_tickets')
  async liveGames(@Payload() data) {
    this.liveFeedService.resolveTickets(data);
    // this.liveFeedService.insertFeed(data);
  }
}
