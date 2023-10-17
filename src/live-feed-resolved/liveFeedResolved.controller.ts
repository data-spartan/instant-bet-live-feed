import { Controller, Inject } from '@nestjs/common';
import { LiveFeedResolvedService } from './liveFeedResolved.service';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class LiveFeedResolvedController {
  constructor(
    private readonly liveFeedService: LiveFeedResolvedService,
    @Inject('LIVE_FEED_RESOLVED_MICROSERVICE')
    private readonly kaflaClient: ClientKafka,
  ) {}

  @EventPattern('live_feed_resolved')
  async liveData(@Payload() data) {
    this.liveFeedService.insertFeed(data);
  }
}
