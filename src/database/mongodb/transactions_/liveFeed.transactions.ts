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
import { asyncScheduler } from 'rxjs';
import { joinObjProps } from 'src/utils/joinObjectProps.utils';
import { LiveFeed } from '../schemas/liveFeed.schema';

export async function liveFeedTransaction(
  repo: any,
  updateArr: Object[],
  consErrCount: Object[],
  partTopOff,
) {
  const session = await repo.startSession();
  try {
    session.startTransaction();
    await this.repo.bulkWrite(updateArr);
    await session.commitTransaction();
    // await session.endSession();
    return true;
  } catch (e) {
    await session.abortTransaction();

    const pattern = joinObjProps(partTopOff);
    let index;
    let found;
    if (consErrCount.length) {
      for (const [index_, item] of consErrCount.entries()) {
        if (item['pattern'] === pattern) {
          index = index_;
          console.log(index);
          item['count'] += 1;
          found = true;
          break;
        }
      }
      if (!found) {
        index = consErrCount.push({ pattern, count: 1 }) - 1;
      }
    } else {
      index = 0;
      consErrCount.push({ pattern, count: 1 });
    }
    return { error: new RpcException(`STEFAN CAR ${e}`), errIndex: index };
  } finally {
    await session.endSession();
  }
}
