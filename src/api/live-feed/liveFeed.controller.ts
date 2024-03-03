import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { LiveFeedService } from './liveFeed.service';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
  MessageHandler,
  ServerKafka,
  ClientProxy,
} from '@nestjs/microservices';
import { Consumer } from 'kafkajs';
import { KafkaCtx } from 'src/decorators/kafkaContext.decorator';
import { CustomKafkaContext } from 'src/interfaces/kafkaContext.interface';
import { KafkaLoggingInterceptor } from 'src/interceptors/kafkaConsumer.interceptor';
import { Console } from 'console';
import { ConfigService } from '@nestjs/config';
import { joinObjProps } from 'src/utils/joinObjectProps.utils';
import { LiveFeedDocument } from 'src/database/mongodb/schemas/liveFeed.schema';
import { EVENT_NEW_FIXTURES } from 'src/redis/redis.constants';
import { LiveFeedTopicPatterns } from 'src/kafka/topic-patterns/liveFeed.patterns';
import { LiveFeedType } from 'src/types/liveFeed.type';
import {
  LiveResolvedType,
  ResolvedArrayType,
} from 'src/types/liveResolved.type';
import { RedisCacheService } from 'src/redisCache/redisCache.service';

@Controller('feed')
export class LiveFeedController {
  constructor(
    private readonly liveFeedService: LiveFeedService,
    // @Inject('LIVE_FEED') private readonly clientKafka: ClientKafka,
    //inject if prefer this clientaKafka approach,
    private readonly redisService: RedisCacheService,
  ) {}

  // @UseInterceptors(CatchExceptionInterceptor)
  @EventPattern(LiveFeedTopicPatterns.LiveFeed)
  async liveData(
    @Payload() data: LiveFeedType,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ): Promise<void> {
    const idsToSend = await this.liveFeedService.insertFeed(data, {
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
    this.redisService.publish(EVENT_NEW_FIXTURES, {
      event: 'games',
      data: idsToSend, //signal WS redis pub/sub to load newly arrived fixtures and and broadcast to all connceted clients
    });
  }

  @EventPattern(LiveFeedTopicPatterns.LiveResolved)
  async liveResolved(
    @Payload() data: ResolvedArrayType,
    @KafkaCtx()
    { offset, partition, topic, consumer, producer }: CustomKafkaContext,
  ): Promise<void> {
    const resp = await this.liveFeedService.insertResolved(data, producer, {
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
    { kafkaCtx, offset, partition, topic, consumer }: CustomKafkaContext,
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
