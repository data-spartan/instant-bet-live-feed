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
    try {
      const enviroment = process.env.NODE_ENV;
      const dbSufix = enviroment !== 'test' ? '' : 'TEST';
      const db_hostname =
        enviroment === 'production' ? this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_URL,
        ) : 'mongodb://localhost';
      return {
        uri: `${db_hostname}:${this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_PORT,
        )}`,
        dbName: `${this.configService.getOrThrow<string>(
          MongodbConfigEnum.MONGODB_NAME,
        )}${dbSufix}`,
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
        //   replicaSet: this.configService.get('MONGODB_REPL_SET'),
        //   authSource:  this.configService.get('MONGODB_AUTH_SOURCE'),
      };
    } catch (error) {
      throw new Error(`Mongoose Config Error: ${error.message}`);
    }
  }
}

