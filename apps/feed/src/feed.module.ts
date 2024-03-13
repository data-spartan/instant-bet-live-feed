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
import * as Joi from 'joi';

@Module({
  imports: [
    LiveFeedModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        APP_NAME: Joi.string().required(),
        APP_PORT: Joi.number().required(),
        APP_BASE_DIR: Joi.string().required(),
        NODE_ENV: Joi.string().required(),

        KAFKA_BROKERS: Joi.string().required(),
        KAFKA_TOPICS: Joi.string().required(),
        CONSUMERS_NUM: Joi.number().required(),
        KAFKA_CONSUMER_DEFAULT_RETRIES: Joi.number().required(),
        KAFKA_PRODUCER_DEFAULT_RETRIES: Joi.number().required(),
        KAFKA_BROKER_0_PORT: Joi.number().required(),
        KAFKA_BROKER_1_PORT: Joi.number().required(),
        KAFDROP_PORT: Joi.number().required(),

        ZOOKEEPER_0_PORT: Joi.number().required(),
        ZOOKEEPER_1_PORT: Joi.number().required(),

        MONGODB_URL: Joi.string().required(),
        MONGODB_PORT: Joi.number().required(),
        MONGODB_USERNAME: Joi.string().required(),
        MONGODB_PASSWORD: Joi.string().required(),
        MONGODB_NAME: Joi.string().required(),

        REDIS_HOSTNAME: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_INTER_PORT: Joi.number().required(),
        COMMANDER_PORT: Joi.number().required(),
        REDIS_TYPE: Joi.string().required(),

        LOG_DIR: Joi.string().required(),
        LOG_MAXSIZE: Joi.number().required(),
        LOG_MAXFILES: Joi.number().required(),
      }),
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
