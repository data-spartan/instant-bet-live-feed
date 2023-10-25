import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopic,
  KafkaMessage,
} from 'kafkajs';
import { IConsumer } from './consumer.interface';
import { KafkajsConsumer } from './kafkajs.consumer';
import {
  SUBSCRIBER_FN_REF_MAP,
  SUBSCRIBER_OBJ_REF_MAP,
} from './kafka.decorator';

@Injectable()
export class ConsumerService implements OnModuleInit, OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];
  private readonly numConsumers;
  constructor(private readonly configService: ConfigService) {
    this.numConsumers = 2;
  }

  async onModuleInit() {
    for (let step = 0; step < 2; step++) {
      const consumer = new KafkajsConsumer(
        // { topic: 'live_feed' },
        { groupId: 'test-consumer' },
        this.configService.get('KAFKA_BROKER'),
      );
      await consumer.connect();

      SUBSCRIBER_FN_REF_MAP.forEach((functionRef, topic) => {
        this.bindTopicToConsumer(functionRef, topic, consumer);
      });

      consumer.run_({
        eachMessage: async ({ topic, partition, message }) => {
          const functionRef = SUBSCRIBER_FN_REF_MAP.get(topic);
          const object = SUBSCRIBER_OBJ_REF_MAP.get(topic);
          await functionRef.apply(object, [
            JSON.parse(message.value.toString()),
          ]);
        },
      });

      this.consumers.push(consumer);
    }
  }

  async bindTopicToConsumer(callback, topic, consumer: KafkajsConsumer) {
    await consumer.subscribe_({ topic, fromBeginning: false });
  }

  async onApplicationShutdown(signal?: string) {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
