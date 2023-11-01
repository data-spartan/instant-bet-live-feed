import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Session } from 'inspector';
import {
  ClientSession,
  Document,
  Model,
  Mongoose,
  Schema,
  SessionOperation,
  startSession,
} from 'mongoose';
import { KafkaErrorHandler } from 'src/kafka/kafkaErrorHandler.service';

import { joinObjProps } from 'src/utils/joinObjectProps.utils';
@Injectable()
export class TransactionService {
  constructor(private readonly kafkaErrorHanlder: KafkaErrorHandler) {}
  public async liveFeedTransaction(
    repo: any,
    updateArr: Object[],
    consErrCount: Object[],
    topPartOff,
  ) {
    const session = await repo.startSession();
    try {
      session.startTransaction();
      await repo.bulkWrite(updateArr);
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
      console.log(consErrCount);
      return { error: new RpcException(`STEFAN CAR ${e}`), errIndex: index };
    } finally {
      await session.endSession();
    }
  }
}
