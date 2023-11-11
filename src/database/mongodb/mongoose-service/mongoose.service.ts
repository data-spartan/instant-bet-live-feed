import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Session } from 'inspector';
import { TopicPartitionOffsetAndMetadata } from 'kafkajs';
import {
  ClientSession,
  Document,
  Model,
  Mongoose,
  Schema,
  SessionOperation,
  startSession,
} from 'mongoose';
import {
  KafkaErrorCount,
  KafkaErrorObject,
} from 'src/interfaces/kafkaError.interface';
import { KafkaErrorHandler } from 'src/kafka/kafkaErrorHandler.service';

import { joinObjProps } from 'src/utils/joinObjectProps.utils';
@Injectable()
export class MongooseService {
  constructor(private readonly kafkaErrorHanlder: KafkaErrorHandler) {}
  public async liveFeedTransaction(
    repo: any,
    data: Object[],
    consErrCount: KafkaErrorCount[],
    topPartOff: TopicPartitionOffsetAndMetadata,
  ): Promise<boolean | KafkaErrorObject> {
    const session = await repo.startSession();
    try {
      session.startTransaction();
      await repo.bulkWrite(data, { ordered: false });
      await session.commitTransaction();
      // await session.endSession();
      return true;
    } catch (e) {
      await session.abortTransaction();

      const pattern = joinObjProps(topPartOff);
      const index = await this.kafkaErrorHanlder.errorCounter(
        consErrCount,
        pattern,
      );
      // console.log(consErrCount);
      return { error: new RpcException(e), errIndex: index };
    } finally {
      await session.endSession();
    }
  }

  public async bulkWrite(repo: any, data: Object[]) {
    try {
      await repo.bulkWrite(data, { ordered: false });
    } catch (e) {
      if (e.code === 11000) {
        // Handle duplicate key error (e.g., update the existing document)
        // await yourCollection.updateOne(query.updateOne.filter, query.updateOne.update);
      } else {
        // Handle other errors
        console.error(e);
      }
    }
  }
}
