import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { KafkaOptions } from './interfaces/kafkaOptions.interfaces';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<KafkaOptions>({
    // name: 'LIVE_FEED',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'live-feed',
        brokers: ['localhost:9092', 'localhost:9093'],
      },
      consumer: {
        groupId: 'live-feed-consumer',
      },
      run: {
        autoCommit: false,
      },

      // subscribe: {
      //   topics: ['live_feed', 'live_feed_resolved', 'resolve_tickets'],
      //   fromBeginning: false,
      // },
    },
  });
  app.connectMicroservice<KafkaOptions>({
    // name: 'LIVE_FEED',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'live-feed',
        brokers: ['localhost:9092', 'localhost:9093'],
      },
      consumer: {
        groupId: 'live-feed-consumer',
      },
      run: {
        autoCommit: false,
      },
      // subscribe: {
      //   topics: ['live_feed', 'live_feed_resolved', 'resolve_tickets'],
      //   fromBeginning: false,
      // },
    },
  });
  await app.startAllMicroservices();
  const a = app.getMicroservices();
  console.log(await a[1]['server']['consumer']);
  await app.listen(3000);
}

bootstrap();
