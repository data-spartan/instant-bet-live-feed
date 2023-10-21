import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { KafkaOptions } from './interfaces/kafkaOptions.interfaces';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<KafkaOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'live-feed',
        brokers: ['localhost:9092', 'localhost:9092'],
      },
      consumer: {
        groupId: 'live-feed-consumer',
      },
      // subscribe: {
      //   topics: ['live_feed', 'live_feed_resolved', 'resolve_tickets'],
      //   fromBeginning: false,
      // },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
