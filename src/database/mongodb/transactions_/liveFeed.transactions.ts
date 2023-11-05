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
export class TransactionService {
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
      await repo.bulkWrite(data);
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
}
