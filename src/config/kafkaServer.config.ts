import { Transport } from '@nestjs/microservices';
import { Partitioners, logLevel } from 'kafkajs';
import { WinstonLogCreator } from 'src/logger/logger.kafka';

export const configKafka = (
  brokers: string,
  topics: string,
  retries: number,
) => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'live-feed',
      brokers: brokers.split(','),
      logLevel: logLevel.INFO,
      logCreator: WinstonLogCreator,
    },
    consumer: {
      groupId: 'live-feed-consumer',
      heartbeatInterval: 2500,
      sessionTimeout: 15000,
      retry: { retries: retries, factor: 0, multiplier: 1 }, //after n retries consumer is restarted and reading is tried again
      //but retrying is going indefinite(intenitonal nestjs kafka behaviour) so i implmeneted custom retry logic
      readUncommitted: true,
    },
    subscribe: {
      topics: topics.split(','),
      fromBeginning: true,
      //earliest-> in case when auto.offset.reset kicks in(when offset is deleted duo to log.retetention.hours kicks in)
    },
    run: {
      autoCommit: false,
      partitionsConsumedConcurrently: 1,
    },
    producer: {
      createPartitioner: Partitioners.DefaultPartitioner,
      retry: { retries: retries, factor: 0, multiplier: 1 },
      allowAutoTopicCreation: false,
    },
  },
});
