import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  UseFilters,
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

@UseFilters(new KafkaExceptionFilter())
@Controller('feed')
export class LiveFeedController {
  constructor(
    private readonly liveFeedService: LiveFeedService,
    @Inject('LIVE_FEED') private readonly clientKafka: ClientKafka,
  ) {}

  @EventPattern('live_feed')
  async liveData(
    @Payload() data,
    @KafkaCtx() { kafkaCtx, offset, partition, topic }: any,
  ) {
    this.liveFeedService.insertFeed(data);
    await kafkaCtx.getConsumer().commitOffsets([
      { topic, partition, offset: (Number(offset) + 1).toString() },
      //add +1 bcs evertime consumer restarts it reads last message,
      //  Bcs kafkajs doesnt commit last arrived message
    ]);

    // context.getProducer().send({ topic: 'resolve_tickets', messages: [data] });
    // console.log(await context.getConsumer().describeGroup());
  }

  @EventPattern('live_resolved')
  async liveResolved(
    @Payload() data,
    @KafkaCtx() { kafkaCtx, offset, partition, topic }: any,
  ) {
    // console.log(offset, topic, partition);
    const toResolveTickets = await this.liveFeedService.insertResolved(data);
    if (toResolveTickets)
      this.clientKafka.emit('resolve_tickets', toResolveTickets);
    await kafkaCtx
      .getConsumer()
      .commitOffsets([
        { topic, partition, offset: (Number(offset) + 1).toString() },
      ]);

    // console.log('STEFAN');
  }

  @EventPattern('resolve_tickets')
  async liveGames(
    @Payload() data,
    @KafkaCtx() { kafkaCtx, offset, partition, topic }: any,
  ) {
    await kafkaCtx
      .getConsumer()
      .commitOffsets([
        { topic, partition, offset: (Number(offset) + 1).toString() },
      ]);
    // this.liveFeedService.insertFeed(data);
  }
}
