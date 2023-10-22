import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumerConfig, ConsumerSubscribeTopic, KafkaMessage } from 'kafkajs';
// import { DatabaseService } from '../database/database.service';
import { IConsumer } from './consumer.interface';
import { KafkajsConsumer } from './kafkajs.consumer';

interface KafkajsConsumerOptions {
  topic: ConsumerSubscribeTopic;
  config: ConsumerConfig;
  onMessage: (message: KafkaMessage) => Promise<void>;
}

@Injectable()
export class ConsumerService implements OnModuleInit, OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];

  constructor(
    private readonly configService: ConfigService, // private readonly consumersNum: number, // private readonly databaserService: DatabaseService,
  ) {}

  async onModuleInit() {
    const onMessage = async (message): Promise<Object> => {
      console.log(message.value);
      return {
        value: message.value.toString(),
      };
      // throw new Error('Test error!');
    };
    const consumer = new KafkajsConsumer(
      { topic: 'live_feed' },
      // this.databaserService,
      { groupId: 'test-consumer' },
      this.configService.get('KAFKA_BROKER'),
    );
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  // async consume({ topic, config, onMessage }: KafkajsConsumerOptions) {
  //   const consumer = new KafkajsConsumer(
  //     topic,
  //     // this.databaserService,
  //     config,
  //     this.configService.get('KAFKA_BROKER'),
  //   );
  //   await consumer.connect();
  //   await consumer.consume(onMessage);
  //   this.consumers.push(consumer);
  // }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
