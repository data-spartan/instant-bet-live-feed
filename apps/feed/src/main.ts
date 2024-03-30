import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  KAFKA_CLIENT_ID,
  KAFKA_LIVE_FEED_CONSUMER_GROUP,
} from './api/live-feed/kafka.constants';
import { loggerConfig } from '@app/common/logger/loggerApp.config';
import { FeedModule } from './feed.module';
import { configKafka } from '@app/common/kafka/kafkaServer.config';

async function bootstrap() {
  const app = await NestFactory.create(FeedModule, {
    logger: WinstonModule.createLogger({
      instance: loggerConfig('./apps/feed'),
    }),
  }); //to use global logger in other services need to put nestjscommon Logger as provider in each module you want to use logger
  app;
  const configService = app.get(ConfigService); //to use configService in main.ts need to first import ConfigModule in AppModule
  const appPort = Number(configService.get('APP_PORT'));
  const appName: string = configService.get('APP_NAME');

  const KAFKA_BROKERS = configService.get('KAFKA_BROKERS');
  const KAFKA_TOPICS = configService.get('KAFKA_TOPICS');
  const CONSUMERS_NUM = +configService.get('CONSUMERS_NUM');

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
      // transformOptions: {
      //   enableImplicitConversion: true, // This enables automatic type conversion
      // },
      whitelist: true,
    }),
  );

  for (let i = 0; i < CONSUMERS_NUM; i++) {
    app.connectMicroservice<any>(
      configKafka(
        KAFKA_BROKERS,
        KAFKA_TOPICS,
        KAFKA_CLIENT_ID,
        KAFKA_LIVE_FEED_CONSUMER_GROUP,
        './apps/feed',
      ),
      {
        inheritAppConfig: true, //in hybrid apps need to add this bcs of enabling global exceptions handlers, pipes...
        //otherwise you must UseFilter on every controller
      },
    );
  }
  await app.startAllMicroservices();
  await app.listen(appPort, () => {
    Logger.log(`${appName} is listening on port: ${appPort}`);
  });
}

bootstrap();
