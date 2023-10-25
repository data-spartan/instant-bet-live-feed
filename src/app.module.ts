import { Global, Module } from '@nestjs/common';
import { LiveFeedModule } from './live-feed/liveFeed.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
// import { LiveFeedController } from './live-feed/liveFeed.controller';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { KafkaExceptionFilter } from './exception-filters/kafkaException.filter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GlobalModule } from './global.module';

@Module({
  imports: [
    LiveFeedModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost/live-feed'),
    GlobalModule,
    // ClientsModule.register([
    //   {
    //     name: 'LIVE_FEED',
    //     transport: Transport.KAFKA,
    //     options: {
    //       client: {
    //         brokers: ['localhost:9092', 'localhost:9093'],
    //       },
    //       producerOnlyMode: true,
    //     },
    //   },
    // ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: KafkaExceptionFilter,
    // },
  ],
})
export class AppModule {}
