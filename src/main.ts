import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  InheritAppConfig,
  KafkaOptions,
} from './interfaces/kafkaOptions.interface';
import { configKafka } from './config/kafkaServer.config';
import { WinstonLogCreator } from './logger/logger.kafka';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { instance } from './logger/logger.app';
import { Logger } from 'winston';
import { Console } from 'console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  }); //to use global logger in other services need to put nestjscommon Logger as provider in each module you want to use logger

  const configService = app.get(ConfigService); //to use configService in main.ts need to first import ConfigModule in AppModule
  const appPort = Number(configService.get('APP_PORT'));

  const KAFKA_BROKERS = configService.get('KAFKA_BROKERS');
  const KAFKA_TOPICS = configService.get('KAFKA_TOPICS');
  const CONSUMERS_NUM = Number(configService.get('CONSUMERS_NUM'));
  const KAFKA_DEFAULT_RETRIES = Number(
    configService.get('KAFKA_DEFAULT_RETRIES'),
  );

  for (let i = 0; i < CONSUMERS_NUM; i++) {
    app.connectMicroservice<any>(
      configKafka(KAFKA_BROKERS, KAFKA_TOPICS, KAFKA_DEFAULT_RETRIES),
      {
        inheritAppConfig: true, //in hybrid apps need to add this bcs of enabling global exceptions handlers, pipes...
        //otherwise you must UseFilter on every controller
      },
    );
  }
  await app.startAllMicroservices();
  await app.listen(appPort, () => {
    instance.info(`App is listening on port: ${appPort}`);
  });
}

bootstrap();
