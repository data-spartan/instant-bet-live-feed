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

import { joinObjProps } from 'src/utils/joinObjectProps.utils';
import { errorCounter } from 'src/kafka/errorRetrier.helper';

export async function liveFeedTransaction(
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
    const index = await errorCounter(consErrCount, pattern);
    console.log(consErrCount);
    return { error: new RpcException(`STEFAN CAR ${e}`), errIndex: index };
  } finally {
    await session.endSession();
  }
}
