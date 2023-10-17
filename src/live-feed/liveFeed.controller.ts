import { Controller } from '@nestjs/common';
import { LiveFeedService } from './liveFeed.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class LiveFeedController {
  constructor(private readonly liveFeedService: LiveFeedService) {}

  @EventPattern('live_feed')
  async liveData(@Payload() data) {
    this.liveFeedService.insertFeed(data);
  }

  @EventPattern('live_feed_resolved')
  async liveResolved(@Payload() data) {
    this.liveFeedService.insertFeed(data);
  }
}
