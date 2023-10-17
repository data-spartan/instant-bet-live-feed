import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConsumerSubscribeTopics } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<any>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'live-feed',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'live-feed-consumer',
      },
      subscribe: {
        topics: ['live_feed', 'live_feed_resolved'],
        fromBeginning: false,
      },
    },
  });
  // app.connectMicroservice<any>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       clientId: 'live-feed-resolved',
  //       brokers: ['localhost:9092'],
  //     },
  //   },
  //   consumer: {
  //     groupId: 'live-feed-resolved-consumer',
  //   },
  //   subscribe: {
  //     topics: ['live_feed_resolved'],
  //     fromBeginning: true,
  //   },
  // });

  // await microservice.listen();
  // await microservice2.listen();
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
