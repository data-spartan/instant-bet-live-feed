import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { KafkaErrorCount } from 'src/interfaces/kafkaError.interface';

@Injectable()
export class KafkaErrorHandler {
  public async errorCounter(
    errCount: KafkaErrorCount[],
    pattern: string,
  ): Promise<number> {
    let index;
    let found;
    console.log(errCount);
    if (errCount.length) {
      for (const [index_, item] of errCount.entries()) {
        if (item['pattern'] === pattern) {
          index = index_;
          item['count'] += 1;
          found = true;
          break;
        }
      }
      if (!found) {
        //if consErrCount is not empty but entry with that pattern doesnt exists
        index = errCount.push({ pattern, count: 1 }) - 1;
      }
    } else {
      //only when consErrCount is empty(first error ever)
      index = 0;
      errCount.push({ pattern, count: 1 });
    }
    return index; //position of kafkaerrcount object in array
  }

  public async producerErrorHandler(
    sent,
    dlq,
    producerErrCount,
    defaultProducerRetries,
  ): Promise<RpcException | boolean> {
    if (dlq) {
      if (sent['errIndex']) {
        const errIndex = sent['errIndex'];
        console.log(producerErrCount[errIndex], 'TEST TEST');
        if (producerErrCount[errIndex]['count'] <= defaultProducerRetries) {
          console.log('IN ERROR PRODUCER', producerErrCount[errIndex]);
          // throw sent['error'];
          return sent['error'];
        } else {
          console.log('PROD ERR COUNT SPLICED');
          producerErrCount.splice(errIndex, 1);
          const sendSlack = true;
          return sendSlack;
        }
      }
    }
    // for resolve toResolveTickets in liveFeedService, there is no need for retry
    return;
  }
}
