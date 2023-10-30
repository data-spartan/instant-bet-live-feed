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
import { KafkaExceptionFilter } from 'src/exception-filters/kafkaException.filter';
import { CustomKafkaContext } from 'src/interfaces/kafkaContext.interface';
import { CatchExceptionInterceptor } from 'src/interceptors/kafkaConsumer.interceptor';
import { Console } from 'console';
import { ConfigService } from '@nestjs/config';
import { joinObjProps } from 'src/utils/joinObjectProps.utils';

@Controller('feed')
export class LiveFeedController {
  // private consumerErrCount;
  // private producerErrCount;
  // private liveFeedErrThrehsold;
  // private liveResolvedErrThrehsold;
  // private dlqErrThrehsold;
  // private defaultRetries;
  constructor(
    private readonly liveFeedService: LiveFeedService,
    // private readonly configService: ConfigService,
    @Inject('LIVE_FEED') private readonly clientKafka: ClientKafka,
  ) {
    // this.consumerErrCount = [];
    // // this.producerErrCount = { count: 0 };
    // this.defaultRetries = Number(
    //   this.configService.get('KAFKA_DEFAULT_RETRIES'),
    // );
  }

  // @UseInterceptors(CatchExceptionInterceptor)
  @EventPattern('live_feed')
  async liveData(
    @Payload() data: any,
    @KafkaCtx()
    { offset, partition, topic, consumer }: CustomKafkaContext,
  ) {
    // if (this.consumerErrCount['count'] === this.defaultRetries) {
    //   console.log('IN ERROR');
    //   await consumer.commitOffsets([{ topic, partition, offset }]);
    //   this.consumerErrCount['count'] = 0;
    // }
    await this.liveFeedService.insertFeed(data, consumer, {
      topic,
      partition,
      offset,
    });
    // if (inserted) {
    //   await consumer.commitOffsets([{ topic, partition, offset }]);
    //   this.consumerErrCount['count'] = 0;
    // }
    // context.getProducer().send({ topic: 'resolve_tickets', messages: [data] });
  }

  // @EventPattern('live_resolved')
  // async liveResolved(
  //   @Payload() data,
  //   @KafkaCtx()
  //   { offset, partition, topic, consumer, producer }: CustomKafkaContext,
  // ) {
  //   //extremely imporatant that after n retries you send resolved data to dlq bcs ticket payment depends on it
  //   // if (this.consumerErrCount['count'] === 5) {
  //   //   //SEND TO DLQ
  //   //   this.clientKafka.emit('dlq_resolved', data);
  //   //   await consumer.commitOffsets([{ topic, partition, offset }]);
  //   //   this.consumerErrCount['count'] = 0;
  //   // }

  //   await this.liveFeedService.insertResolved(data, consumer, producer, {
  //     topic,
  //     partition,
  //     offset,
  //   });
  //   // if (toResolveTickets) {
  //   //   this.clientKafka.emit('resolve_tickets', toResolveTickets);
  //   // }
  //   // await consumer.commitOffsets([{ topic, partition, offset }]);
  //   // console.log('POSLE COMMITA');
  // }

  //   // @EventPattern('resolve_tickets')
  //   // async liveGames(
  //   //   @Payload() data,
  //   //   @KafkaCtx()
  //   //   { kafkaCtx, offset, partition, topic, consumer }: CustomKafkaContext,
  //   // ) {
  //   //   await consumer.commitOffsets([{ topic, partition, offset }]);
  //   //   // this.liveFeedService.insertFeed(data);
  //   // }

  //   @EventPattern('dlq_resolved')
  //   async dlqResolved(
  //     @Payload() data,
  //     { kafkaCtx, offset, partition, topic, consumer }: CustomKafkaContext,
  //   ) {
  //     if (this.consumerErrCount['count'] === 10) {
  //       //SEND NOTIFICATION TO SLACK
  //       // await consumer.commitOffsets([{ topic, partition, offset }]);
  //       this.consumerErrCount['count'] = 0;
  //     }
  //     await this.liveFeedService.insertDlqResolved(data, this.consumerErrCount);
  //     await consumer.commitOffsets([{ topic, partition, offset }]);
  //   }
}
