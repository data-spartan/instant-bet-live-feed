import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './feed.service';
import { AppController } from './feed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { GlobalModule } from './global.module';
import { LiveFeedModule } from './api/live-feed/liveFeed.module';
import { MongooseConfigService } from '@app/common/mongoConf/mongoose.config';
import { RedisCacheModule } from '@app/common/redisCache/redisCache.module';
import { RpcExceptionFilter } from '@app/common';

@Module({
  imports: [
    LiveFeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      /*
      using this.config.get can read proces.env.VAR or .env file if specified
      dockerized app doesnt read direclty from .env. We pass .env content in docker-compose file
       and config.get is reading var as proces.env behind the scenes
       */
      ignoreEnvFile: process.env.NODE_ENV === 'production' ? true : false,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    RedisCacheModule,
    GlobalModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CatchExceptionInterceptor,
    // },
  ],
})
export class FeedModule {}
