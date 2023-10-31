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
  LiveFeed,
  LiveFeedDocument,
} from 'src/database/mongodb/schemas/liveFeed.schema';
import {
  LiveFeedResolved,
  LiveFeedResolvedDocument,
} from 'src/database/mongodb/schemas/liveFeedResolved.schema';
import { liveFeedTransaction } from 'src/database/mongodb/transactions_/liveFeed.transactions';
import { KafkaExceptionFilter } from 'src/exception-filters/kafkaException.filter';
import { producerErrorHandler } from 'src/kafka/producerHandler';
import { kafkaProducer } from 'src/kafka/producerKafka';
import { joinObjProps } from 'src/utils/joinObjectProps.utils';

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
  public async insertFeed(
    feed,
    consumer: Consumer,
    topPartOff: TopicPartitionOffsetAndMetadata,
  ) {
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
      } else {
      }
    }
    await consumer.commitOffsets([topPartOff]);
    return true;
  }

  public async insertResolved(
    resolvedData: any,
    consumer: Consumer,
    producer: Producer,
    topPartOff: TopicPartitionOffsetAndMetadata,
  ) {
    // const session = await this.resolvedRepo.startSession();
    const toResolveTickets = [];
    const updateArr = resolvedData.map((obj) => ({
      updateOne: {
        filter: {
          _d: obj.fixtureId,
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

    if (resolved['errIndex']) {
      const errIndex = resolved['errIndex'];
      if (
        this.consumerErrCount[errIndex]['count'] <= this.defaultConsumerRetries
      ) {
        console.log('IN ERROR CONSUMER', this.consumerErrCount[errIndex]);
        throw resolved['error'];
      } else {
        //TODO create separate mciroservice which will take care of dlq
        const toSlack = await kafkaProducer(
          resolvedData,
          'dlq_resolve',
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
          console.log('SENT TO SLACK');
          return;
        }
      }
    }
    if (!resolved['errIndex']) {
      if (toResolveTickets) {
        console.log('IN RESOLVE TIKCETS');
        //toResolveTickets doesnt need to be sent via dlq bcs non-sent resolved data is sent to 'dlq_resolved'
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

    await consumer.commitOffsets([topPartOff]);
    console.log('COMITTED RESOLVED');
    return true;
    //must use tranaction with bulkwrite bcs of dupl key error
  }

  public async insertDlqResolved(resolved: any, consErrCount) {
    const session = await this.feedRepo.startSession();
    const updateArr = resolved.map((obj) => ({
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
    //must use tranaction with bulkwrite bcs of dupl key error
    try {
      session.startTransaction();
      await this.resolvedRepo.bulkWrite(updateArr);
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      consErrCount['count'] += 1;
      throw new RpcException(`STEFAN CAR ${e}`);
    } finally {
      await session.endSession();
    }
  }

  public async resolveTickets(resolvedId: number[]) {
    // this.resolvedRepo
  }
}
