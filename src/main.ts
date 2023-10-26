import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { KafkaOptions } from './interfaces/kafkaOptions.interfaces';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<KafkaOptions>(
    {
      // name: 'LIVE_FEED',
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'live-feed',
          brokers: ['localhost:9092', 'localhost:9093'],
        },
        consumer: {
          groupId: 'live-feed-consumer',
          heartbeatInterval: 2000,
          sessionTimeout: 10000,
          retry: { retries: 1 },
          readUncommitted: false,
        },
        subscribe: {
          topics: ['live_feed', 'live_feed_resolved'],
          fromBeginning: false,
        },
        run: {
          autoCommit: false,
        },
      },
    },
    { inheritAppConfig: true }, //in hybrid apps need to add this bcs of enabling global exceptions handlers, pipes...
    //otherwise you must UseFilter on every controller
  );
  app.connectMicroservice<KafkaOptions>(
    {
      // name: 'LIVE_FEED',
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'live-feed',
          brokers: ['localhost:9092', 'localhost:9093'],
        },
        consumer: {
          groupId: 'live-feed-consumer',
          heartbeatInterval: 2000,
          sessionTimeout: 10000,
          retry: { retries: 1 },
          readUncommitted: false,
        },
        subscribe: {
          topics: ['live_feed', 'live_feed_resolved'],
          fromBeginning: false,
        },
        run: {
          autoCommit: false,
        },
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();
  const micro = app.getMicroservices();

  // console.log(await micro[1]['server']);
  await app.listen(3000);
}

bootstrap();
