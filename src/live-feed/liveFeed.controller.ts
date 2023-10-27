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
import { SubscribeTo } from 'src/kafka/kafka.decorator';
import { Consumer } from 'kafkajs';
import { KafkaCtx } from 'src/decorators/kafkaContext.decorator';
import { KafkaExceptionFilter } from 'src/exception-filters/kafkaException.filter';
import { CustomKafkaContext } from 'src/interfaces/kafkaContext.interface';
import { CatchExceptionInterceptor } from 'src/interceptors/kafkaConsumer.interceptor';

@Controller('feed')
export class LiveFeedController {
  private errorCount;
  constructor(
    private readonly liveFeedService: LiveFeedService,
    @Inject('LIVE_FEED') private readonly clientKafka: ClientKafka,
  ) {
    this.errorCount = { count: 1 };
  }

  // @UseInterceptors(CatchExceptionInterceptor)
  @EventPattern('live_feed')
  async liveData(
    @Payload() data: any,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ) {
    console.log(this.errorCount, 'IN CONTROO');

    if (this.errorCount['count'] === 2) {
      console.log('IN ERROR');
      await consumer.commitOffsets([{ topic, partition, offset }]);
      this.errorCount['count'] = 0;
    }
    const inserted = await this.liveFeedService.insertFeed(
      data,
      this.errorCount,
    );
    if (inserted) {
      await consumer.commitOffsets([{ topic, partition, offset }]);
      this.errorCount['count'] = 0;
    }

    // context.getProducer().send({ topic: 'resolve_tickets', messages: [data] });
  }

  // @EventPattern('live_resolved')
  // async liveResolved(
  //   @Payload() data,
  //   @KafkaCtx()
  //   { kafkaCtx, offset, partition, topic, consumer }: CustomKafkaContext,
  // ) {
  //   //extremely imporatant that after n retries you send resolved data to dlq bcs ticket payment depends on it
  //   if (this.errorCount['count'] === 1) {
  //     //SEND TO DLQ
  //     await consumer.commitOffsets([{ topic, partition, offset }]);
  //     this.errorCount['count'] = 0;
  //   }

  //   const toResolveTickets = await this.liveFeedService.insertResolved(data);
  //   if (toResolveTickets) {
  //     this.clientKafka.emit('resolve_tickets', toResolveTickets);
  //     await consumer.commitOffsets([{ topic, partition, offset }]);
  //     console.log('POSLE COMMITA');
  //   }
  // }

  // @EventPattern('resolve_tickets')
  // async liveGames(
  //   @Payload() data,
  //   @KafkaCtx() { kafkaCtx, offset, partition, topic }: any,
  // ) {
  //   await kafkaCtx
  //     .getConsumer()
  //     .commitOffsets([
  //       { topic, partition, offset: (Number(offset) + 1).toString() },
  //     ]);
  //   // this.liveFeedService.insertFeed(data);
  // }

  // @EventPattern('dlq_resolved')
  // async liveGames(
  //   @Payload() data,
  //   { kafkaCtx, offset, partition, topic, consumer }: CustomKafkaContext,
  // ) {
  //   if (this.errorCount['count'] === 2) {
  //     //SEND TO DLQ
  //     await consumer.commitOffsets([{ topic, partition, offset }]);
  //     this.errorCount['count'] = 0;
  //   }

  //   const toResolveTickets = await this.liveFeedService.insertResolved(data);
  //   if (toResolveTickets) {
  //     this.clientKafka.emit('resolve_tickets', toResolveTickets);
  //     await consumer.commitOffsets([{ topic, partition, offset }]);
  //     console.log('POSLE COMMITA');
  //   }
  // }
}
