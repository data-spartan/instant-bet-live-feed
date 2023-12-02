import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleFactoryOptions,
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { MongooseOptions } from 'mongoose';
import { MongodbConfigEnum } from 'src/database/mongodb/mongodbConfig.enum';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    const dbName = process.env.NODE_ENV !== 'test' ? '' : 'TEST';

    try {
      return {
        uri: `${this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_URL,
        )}:${this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_PORT,
        )}`,
        dbName: `${this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_NAME,
        )}${dbName}`,
        user: this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_USERNAME,
        ),
        pass: this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_PASSWORD,
        ),
        retryAttempts: 10,
        autoCreate: true,
        //   autoIndex: false,
        //   authSource: 'admin',
        //   replicaSet: this.configService.get('MONGO_REPL_SET'),
        //   authSource:  this.configService.get('MONGO_AUTH_SOURCE'),
      };
    } catch (error) {
      throw new Error(`Mongoose Config Error: ${error.message}`);
    }
  }
}
