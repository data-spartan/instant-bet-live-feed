import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleFactoryOptions,
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { MongooseOptions } from 'mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    const dbName = process.env.NODE_ENV !== 'test' ? '' : 'TEST';
    console.log(this.configService.get('MONGODB_URL'));
    return {
      uri: `${this.configService.get('MONGODB_URL')}:${this.configService.get(
        'MONGODB_PORT',
      )}`,
      dbName: `${this.configService.get('MONGODB_NAME')}${dbName}`,
      user: this.configService.get('MONGO_USERNAME'),
      pass: this.configService.get('MONGO_PASSWORD'),
      retryAttempts: 1,
      autoCreate: true,
      //   autoIndex: false,
      //   authSource: 'admin',
      //   replicaSet: this.configService.get('MONGO_REPL_SET'),
      //   authSource:  this.configService.get('MONGO_AUTH_SOURCE'),
    };
  }
}
