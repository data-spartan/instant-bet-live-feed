import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
// import { LiveFeedController } from './live-feed/liveFeed.controller';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
// import { RpcExcFilter } from './exception-filters/kafkaException.filter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GlobalModule } from './global.module';
import { AllExceptionsFilter } from './exception-filters/allExceptions.filter';
import { MongooseConfigService } from './config/mongoose.config';
import { DirectoryCreationService } from './shared/dirCreation';
import { LiveFeedModule } from './api/live-feed/liveFeed.module';

@Module({
  imports: [
    LiveFeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    GlobalModule,
  ],
  controllers: [AppController],
  providers: [
    DirectoryCreationService,
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: KafkaExceptionFilter,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CatchExceptionInterceptor,
    // },
  ],
})
export class AppModule {}
