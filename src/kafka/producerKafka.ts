import { RpcException } from '@nestjs/microservices';
import { Producer, TopicPartitionOffsetAndMetadata } from 'kafkajs';
import { joinObjProps } from 'src/utils/joinObjectProps.utils';
import { Injectable } from '@nestjs/common';
import { KafkaErrorHandler } from './kafkaErrorHandler.service';
import { KafkaErrorCount } from 'src/interfaces/kafkaError.interface';

@Injectable()
export class KafkaProducerService {
  constructor(private readonly kafkaErrorHandler: KafkaErrorHandler) {}

  public async kafkaProducer(
    data: string[] | Object,
    topic: string,
    producer: Producer,
    acks: number,
    producerErrCount: KafkaErrorCount[],
    topPartOff: TopicPartitionOffsetAndMetadata,
    defaultProducerRetries: number,
    retryAgain: boolean,
  ): Promise<void | boolean | RpcException> {
    try {
      await producer.send({
        topic: topic,
        messages: [{ value: JSON.stringify(data) }],
        acks: acks,
      });
      console.log('PRODUCER SENT');
    } catch (e) {
      console.log('IN ERR');
      const pattern = joinObjProps(topPartOff);
      const index = await this.kafkaErrorHandler.errorCounter(
        producerErrCount,
        pattern,
      );
      const sentDlq = {
        error: new RpcException(`Producer Error: ${e}`),
        errIndex: index,
      };
      //checks if number of producer retries is exceded or not
      //if yes it returns true and triggers sending notification to slack
      //if not it returns error to be thrown and cycle is repeated
      const value = await this.kafkaErrorHandler.producerErrorHandler(
        sentDlq,
        retryAgain,
        producerErrCount,
        defaultProducerRetries,
      );
      // return value;
      if (!(value instanceof Error)) {
        return value;
      }
      throw value;
    }
  }
}
