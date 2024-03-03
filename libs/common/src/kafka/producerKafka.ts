import { RpcException } from '@nestjs/microservices';
import { Producer, TopicPartitionOffsetAndMetadata } from 'kafkajs';
import { Injectable } from '@nestjs/common';
import { KafkaErrorHandler } from './kafkaErrorHandler.service';
import { KafkaErrorCount } from '../types/kafka.type';
import { joinObjProps } from '../utils/joinObjectProps.utils';

@Injectable()
export class KafkaProducerService {
  constructor(private readonly kafkaErrorHandler: KafkaErrorHandler) {}

  public async kafkaProducer(
    data: string[] | object,
    topic: string,
    producer: Producer,
    producerErrCount: KafkaErrorCount[],
    topPartOff: TopicPartitionOffsetAndMetadata,
    defaultProducerRetries: number,
    retryAgain: boolean,
    acks: number = -1,
  ): Promise<void | boolean | RpcException> {
    try {
      await producer.send({
        topic: topic,
        messages: [{ value: JSON.stringify(data) }],
        acks: acks,
      });
      producer.logger().info('Message sent', { topic });
    } catch (e) {
      console.log('IN ERROR PRODUCER');
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
