import { Controller, Get, Inject } from '@nestjs/common';
import { LiveFeedService } from './liveFeed.service';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

@Controller('feed')
export class LiveFeedController {
  constructor(
    private readonly liveFeedService: LiveFeedService,
  ) // @Inject('LIVE_FEED_MICROSERVICE') private readonly liveFeed: ClientKafka,
  {}

  @EventPattern('live_feed')
  async liveData(@Payload() data) {
    this.liveFeedService.insertFeed(data);
  }

  @EventPattern('live_resolved')
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
