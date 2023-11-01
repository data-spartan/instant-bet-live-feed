import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  InheritAppConfig,
  KafkaOptions,
} from './interfaces/kafkaOptions.interfaces';
import { KafkaExceptionFilter } from './exception-filters/kafkaException.filter';
import { configKafka } from './config/kafkaServer.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  const micro = app.getMicroservices();
  // console.log(await micro[1]['server']);
  await app.listen(appPort);
}

bootstrap();
