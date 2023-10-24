import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
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

@Controller('feed')
export class LiveFeedController {
  constructor(
    private readonly liveFeedService: LiveFeedService,
    @Inject('LIVE_FEED') private readonly clientKafka: ClientKafka,
  ) {}

  @EventPattern('live_feed')
  async liveData(@Payload() data, @Ctx() context: KafkaContext) {
    // console.log(context.getConsumer());
    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    this.liveFeedService.insertFeed(data);
    await context.getConsumer().commitOffsets([{ topic, partition, offset }]);

    // context.getProducer().send({ topic: 'resolve_tickets', messages: [data] });
    // console.log(await context.getConsumer().describeGroup());
  }

  @EventPattern('live_resolved')
  async liveResolved(@Payload() data, @Ctx() context: KafkaContext) {
    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();

    const toResolveTickets = await this.liveFeedService.insertResolved(data);
    if (toResolveTickets)
      this.clientKafka.emit('resolve_tickets', toResolveTickets);
    await context.getConsumer().commitOffsets([{ topic, partition, offset }]);
    console.log('STEFAN');
    await context.getConsumer().disconnect();
  }

  @EventPattern('resolve_tickets')
  async liveGames(@Payload() data) {
    // this.liveFeedService.resolveTickets(data);
    console.log(data[0]['fixtureId']);
    // this.liveFeedService.insertFeed(data);
  }
}
