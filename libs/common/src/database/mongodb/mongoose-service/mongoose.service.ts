import { KafkaErrorHandler } from '@app/common/kafka/kafkaErrorHandler.service';
import {
  KafkaErrorCount,
  KafkaErrorObject,
} from '@app/common/types/kafka.type';
import { joinObjProps } from '@app/common/utils/joinObjectProps.utils';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { TopicPartitionOffsetAndMetadata } from 'kafkajs';

@Injectable()
export class MongooseService {
  constructor(
    private readonly kafkaErrorHanlder: KafkaErrorHandler,
    private readonly logger: Logger,
  ) {}
  public async liveFeedTransaction(
    repo: any,
    data: object[],
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

  public async bulkWrite(
    repo: any,
    data: object[],
    consErrCount: KafkaErrorCount[],
    topPartOff: TopicPartitionOffsetAndMetadata,
  ) {
    try {
      await repo.bulkWrite(data, { ordered: false });
      //ordered: false gives us ability to insert those records which satisfied condition and throw error for those which dont
      return true;
    } catch (e) {
      if (e.code === 11000) {
        //it happens bcs this condition: updatedAt: { $lte: obj.sentTime } cant find $lte match, so it upserts and attempts to insert new document with same _id
        //bcs that it throws error
        //for existing matches which sentTime is not lower than arrived matches
        this.logger.error(e.writeErrors['0'].errmsg);
        return true; //it means that arrived matches are actualy older than existing in db, we need to commit those consumer offset and continue
        // we only need latest data
      } else {
        const pattern = joinObjProps(topPartOff);
        const index = await this.kafkaErrorHanlder.errorCounter(
          consErrCount,
          pattern,
        );
        return { error: new RpcException(e), errIndex: index };
      }
    }
  }
}
