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
import { CatchExceptionInterceptor } from 'src/interceptors/kafkaConsumer.interceptor';
import { Console } from 'console';
import { ConfigService } from '@nestjs/config';
import { joinObjProps } from 'src/utils/joinObjectProps.utils';
import { LiveFeedDocument } from 'src/database/mongodb/schemas/liveFeed.schema';

@Controller('feed')
export class LiveFeedController {
  constructor(
    private readonly liveFeedService: LiveFeedService,
    @Inject('LIVE_FEED') private readonly clientKafka: ClientKafka,
  ) {}

  // @UseInterceptors(CatchExceptionInterceptor)
  @EventPattern('live_feed')
  async liveData(
    @Payload() data: any,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ) {
    const resp = await this.liveFeedService.insertFeed(data, {
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
      console.log('COMITTED FEED');
    }
  }

  @EventPattern('live_resolved')
  async liveResolved(
    @Payload() data,
    @KafkaCtx()
    { offset, partition, topic, consumer, producer }: CustomKafkaContext,
  ) {
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
      console.log('COMITTED RESOLVED');
    }
  }

  // @EventPattern('resolve_tickets')
  // async liveGames(
  //   @Payload() data,
  //   @KafkaCtx()
  //   { kafkaCtx, offset, partition, topic, consumer }: CustomKafkaContext,
  // ) {
  //   console.log('IN RESOLVE TICKETS');
  //   await consumer.commitOffsets([{ topic, partition, offset }]);
  //   // this.liveFeedService.insertFeed(data);
  // }

  @EventPattern('dlq_resolved')
  async dlqResolved(
    @Payload() data,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ) {
    console.log('IN DLQ_RESOLVED');
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
      console.log('COMITTED DLQ RESOLVED');
    }
  }
}
