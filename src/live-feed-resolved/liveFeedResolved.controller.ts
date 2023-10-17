import { Controller } from '@nestjs/common';
import { LiveFeedResolvedService } from './liveFeedResolved.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class LiveFeedResolvedController {
  constructor(private readonly liveFeedService: LiveFeedResolvedService) {}

  @EventPattern('live_feed_resolved')
  async liveData(@Payload() data) {
    this.liveFeedService.insertFeed(data);
  }
}
