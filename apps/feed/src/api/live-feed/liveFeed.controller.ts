import { Controller } from '@nestjs/common';
import { LiveFeedService } from './liveFeed.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RedisCacheService } from '@app/common/redisCache/redisCache.service';
import { CustomKafkaContext, KafkaCtx } from '@app/common';
import {
  LiveFeedRedisChannel,
  LiveFeedTopicPatterns,
} from './topic-patterns/liveFeed.patterns';
import { FixturesArrayDto } from './dto/feed.dto';
import { ResolvedFixturesDto } from './dto/resolvedFixtures.dto';

@Controller('feed')
export class LiveFeedController {
  constructor(
    private readonly liveFeedService: LiveFeedService,
    // @Inject('LIVE_FEED') private readonly clientKafka: ClientKafka,
    //inject if prefer this clientaKafka approach,
    private readonly redisService: RedisCacheService,
  ) {}

  @EventPattern(LiveFeedTopicPatterns.LiveFeed)
  async liveData(
    @Payload() { fixtures }: FixturesArrayDto,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ): Promise<void> {
    const idsToSend = await this.liveFeedService.insertFeed(fixtures, {
      topic,
      partition,
      offset,
    });

    if (idsToSend) {
      consumer.commitOffsets([
        {
          topic,
          partition,
          offset,
        },
      ]);
      // console.log('COMITTED FEED');
    }
    this.redisService.publish(LiveFeedRedisChannel.EVENT_NEW_FIXTURES, {
      event: 'games',
      data: idsToSend, //signal WS redis pub/sub to load newly arrived fixtures and and broadcast to all connceted clients
    });
  }

  @EventPattern(LiveFeedTopicPatterns.LiveResolved)
  async liveResolved(
    @Payload() { resolved }: ResolvedFixturesDto,
    @KafkaCtx()
    { offset, partition, topic, consumer, producer }: CustomKafkaContext,
  ): Promise<void> {
    const resp = await this.liveFeedService.insertResolved(resolved, producer, {
      topic,
      partition,
      offset,
    });
    if (resp) {
      consumer.commitOffsets([
        {
          topic,
          partition,
          offset,
        },
      ]);
      // console.log('COMITTED RESOLVED');
    }
  }

  @EventPattern(LiveFeedTopicPatterns.ResolveTickets)
  async liveGames(
    @Payload() data,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ): Promise<void> {
    await consumer.commitOffsets([{ topic, partition, offset }]);
    //TODO Move everthing related to tickets resolving to separate microservice(betting-engine)
  }

  @EventPattern(LiveFeedTopicPatterns.DlqResolved)
  async dlqResolved(
    @Payload() data,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ) {
    const resp = await this.liveFeedService.insertDlqResolved(data, {
      topic,
      partition,
      offset,
    });

    if (resp) {
      consumer.commitOffsets([
        {
          topic,
          partition,
          offset,
        },
      ]);
      // console.log('COMITTED DLQ RESOLVED');
      //TODO Move everthing related to tickets resolving to separate microservice(betting-engine)
    }
  }
}
