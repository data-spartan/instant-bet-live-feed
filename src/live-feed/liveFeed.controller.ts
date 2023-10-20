import { Controller, Get } from '@nestjs/common';
import { LiveFeedService } from './liveFeed.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('feed')
export class LiveFeedController {
  constructor(private readonly liveFeedService: LiveFeedService) {}

  @EventPattern('live_feed')
  async liveData(@Payload() data) {
    this.liveFeedService.insertFeed(data);
  }

  @EventPattern('live_resolved')
  async liveResolved(@Payload() data) {
    this.liveFeedService.insertResolved(data);
  }

  // @EventPattern('resolve_tickets')
  // async liveGames(@Payload() data) {
  //   this.liveFeedService.insertFeed(data);
  // }
}
