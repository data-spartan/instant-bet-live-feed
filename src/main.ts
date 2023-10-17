/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConsumerSubscribeTopics } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice<any>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'live-feed',
        brokers: ['localhost:9092'],
      },
      subscribe: {
        topics: ['live_feed'],
        fromBeginning: true,
      },
      consumer: {
        groupId: 'live-feed-consumer',
      },
    },
  });
  const microservice2 = app.connectMicroservice<any>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'live-feed-resolved',
        brokers: ['localhost:9092'],
      },
      subscribe: {
        topics: ['live_feed_resolved'],
        fromBeginning: true,
      },
    },
    consumer: {
      groupId: 'live-feed-resolved-consumer',
    },
  });

  await microservice.listen();
  await microservice2.listen();
  await app.listen(3000);
}

bootstrap();
