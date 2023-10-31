import { ConsoleLogger, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientKafka,
  KafkaRetriableException,
  RpcException,
} from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Consumer, Producer, TopicPartitionOffsetAndMetadata } from 'kafkajs';
import { Model, MongooseError } from 'mongoose';
import { type } from 'os';
import { Exception } from 'sass';
import {
  DlqResolved,
  DlqResolvedDocument,
} from 'src/database/mongodb/schemas/dlqResolved.schema';
import {
  LiveFeed,
  LiveFeedDocument,
} from 'src/database/mongodb/schemas/liveFeed.schema';
import {
  LiveFeedResolved,
  LiveFeedResolvedDocument,
} from 'src/database/mongodb/schemas/liveFeedResolved.schema';
import { liveFeedTransaction } from 'src/database/mongodb/transactions_/liveFeed.transactions';

import { kafkaProducer } from 'src/kafka/producerKafka';

@Injectable()
export class LiveFeedService {
  private defaultConsumerRetries;
  private defaultProducerRetries;
  private consumerErrCount;
  private producerErrCount;
  constructor(
    @InjectModel(LiveFeed.name)
    private readonly feedRepo: Model<LiveFeedDocument>,
    @InjectModel(LiveFeedResolved.name)
    private readonly resolvedRepo: Model<LiveFeedResolvedDocument>,
    @InjectModel(DlqResolved.name)
    private readonly dlqResolvedRepo: Model<DlqResolvedDocument>,
    private readonly configService: ConfigService,
  ) {
    this.defaultConsumerRetries = Number(
      this.configService.get('KAFKA_CONSUMER_DEFAULT_RETRIES'),
    );
    this.defaultProducerRetries = Number(
      this.configService.get('KAFKA_PRODUCER_DEFAULT_RETRIES'),
    );
    this.consumerErrCount = [];
    this.producerErrCount = [];
  }
  public async insertFeed(feed, topPartOff: TopicPartitionOffsetAndMetadata) {
    // const session = await this.feedRepo.startSession();
    const updateArr = feed.map((obj) => ({
      updateOne: {
        filter: {
          _id: obj.fixtureId,
          updatedAt: { $lte: obj.sentTime },
          //update only latest sent fixtures
          // (can happen that producer send 2 exact fixtures to diff partitions), keep only latest
          //or consumer crashed and and didnt commit offset so it pulls multiple messages(could me multiple fixtures with same id, but sent in diff time )
        },

        update: {
          $setOnInsert: {
            _id: obj.fixtureId,
            source: obj.source,
            type: obj.type,
            competitionString: obj.competitionString,
            region: obj.region,
            regionId: obj.regionId,
            sport: obj.sport,
            sportId: obj.sportId,
            competition: obj.competition,
            competitionId: obj.competitionId,
            fixtureTimestamp: obj.fixtureTimestamp,
            competitor1Id: obj.competitor1Id,
            competitor1: obj.competitor1,
            competitor2Id: obj.competitor2Id,
            competitor2: obj.competitor2,
          },
          $set: {
            scoreboard: obj.scoreboard,
            games: obj.games,
            timeSent: obj.time,
          },
        },

        upsert: true,
        // setDefaultsOnInsert: true,
      },
    }));
    const insertFeed = await liveFeedTransaction(
      this.feedRepo,
      updateArr,
      this.consumerErrCount,
      topPartOff,
    );

    if (insertFeed['errIndex']) {
      const errIndex = insertFeed['errIndex'];
      if (
        this.consumerErrCount[errIndex]['count'] <= this.defaultConsumerRetries
      ) {
        console.log('IN ERROR', errIndex);
        throw insertFeed['error'];
      }
    }
    // await consumer.commitOffsets([topPartOff]);
    return true;
  }

  public async insertResolved(
    resolvedData: any,
    producer: Producer,
    topPartOff: TopicPartitionOffsetAndMetadata,
  ) {
    // const session = await this.resolvedRepo.startSession();
    const toResolveTickets = [];
    const updateArr = resolvedData.map((obj) => ({
      updateOne: {
        filter: {
          _id: obj.fixtureId,
        },
        update: {
          $setOnInsert: {
            _id: obj.fixtureId,
          },
          $set: {
            status:
              obj.status !== 'Ended'
                ? obj.status
                : toResolveTickets.push(obj.fixtureId) && obj.status,
          },
          $push: {
            resolved: {
              $each: obj.resolved,
            },
          },
        },
        upsert: true,
      },
    }));

    const resolved = await liveFeedTransaction(
      this.resolvedRepo,
      updateArr,
      this.consumerErrCount,
      topPartOff,
    );

    //Regarding resolved data its cruccial not to commit messages until all operations are executed successfuly
    //otherwise trigger for resolving payed tickets wont we executed bcs that message is already commited
    //e.g. toResolveTickets is sent to resolve_tickets topic
    if (resolved['errIndex']) {
      const errIndex = resolved['errIndex'];
      if (
        this.consumerErrCount[errIndex]['count'] <= this.defaultConsumerRetries
      ) {
        console.log('IN ERROR CONSUMER', this.consumerErrCount[errIndex]);
        throw resolved['error'];
      }
      //TODO create separate mciroservice which will take care of dlq
      const toSlack = await kafkaProducer(
        resolvedData,
        'dlq_resolved',
        producer,
        -1,
        this.producerErrCount,
        topPartOff,
        this.defaultProducerRetries,
        'sent_dlq',
      );
      this.consumerErrCount.splice(errIndex, 1);
      console.log('CONSUMER ERR COUNT SPLICED');

      if (toSlack) {
        //TODO Send to slack
        // don commit after slack message, try until resolved data
        // is writen to db and sent to resolve_tickets topic successfully
        console.log('SENT TO SLACK');
        return false;
      }
    }
    if (!resolved['errIndex']) {
      if (toResolveTickets) {
        console.log('IN RESOLVE TIKCETS');
        //toResolveTickets doesnt need to be sent via dlq bcs non-sent resolved data is sent to 'dlq_resolved'
        //from dlq_resolved topic and associated microservice we again try to write in database
        await kafkaProducer(
          toResolveTickets,
          'resolve_tickets',
          producer,
          -1,
          this.producerErrCount,
          topPartOff,
          this.defaultProducerRetries,
        );
      }
    }
    //commit only if all opeartions are successfull
    // await consumer.commitOffsets([topPartOff]);
    return true;
  }

  public async insertDlqResolved(
    resolvedDlq: any,
    topPartOff: TopicPartitionOffsetAndMetadata,
  ) {
    const updateArr = resolvedDlq.map((obj) => ({
      updateOne: {
        filter: {
          _id: obj.fixtureId,
        },
        update: {
          $setOnInsert: {
            _id: obj.fixtureId,
          },
          $set: {
            status: obj.status,
          },
          $push: {
            resolved: {
              $each: obj.resolved,
            },
          },
        },
        upsert: true,
      },
    }));
    const dlqResolved = await liveFeedTransaction(
      this.dlqResolvedRepo,
      updateArr,
      this.consumerErrCount,
      topPartOff,
    );
    if (dlqResolved['errIndex']) {
      const errIndex = dlqResolved['errIndex'];
      if (
        this.consumerErrCount[errIndex]['count'] <= this.defaultConsumerRetries
      ) {
        console.log('IN ERROR CONSUMER', this.consumerErrCount[errIndex]);
        throw dlqResolved['error'];
      }
      return false; //in case when num of retries exceded limit, try all again until succeded
    }
    // await consumer.commitOffsets([topPartOff]);
    return true;
  }

  public async resolveTickets(resolvedId: number[]) {
    // this.resolvedRepo
  }
}
