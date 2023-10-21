import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, KafkaRetriableException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import { Exception } from 'sass';
import {
  LiveFeed,
  LiveFeedDocument,
} from 'src/database/schemas/liveFeed.schema';
import {
  LiveFeedResolved,
  LiveFeedResolvedDocument,
} from 'src/database/schemas/liveFeedResolved.schema';

@Injectable()
export class LiveFeedService {
  constructor(
    @InjectModel(LiveFeed.name)
    private readonly feedRepo: Model<LiveFeedDocument>,
    @InjectModel(LiveFeedResolved.name)
    private readonly resolvedRepo: Model<LiveFeedResolvedDocument>,
  ) {}
  public async insertFeed(feed: any) {
    const updateArr = feed.map((obj) => ({
      updateOne: {
        filter: {
          _id: obj.fixtureId,
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
    this.feedRepo.bulkWrite(updateArr);
  }

  public async insertResolved(resolved: any) {
    const toResolveTickets = [];
    const updateArr = resolved.map((obj) => ({
      updateOne: {
        filter: {
          _id: obj.fixtureId,
        },
        update: {
          $setOnInsert: {
            fixtureId: obj.fixtureId,
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
    try {
      await this.resolvedRepo.bulkWrite(updateArr);
      return toResolveTickets;
    } catch (e) {
      throw new MongooseError(e.message);
    }
  }

  public async resolveTickets(resolvedId: number[]) {
    // this.resolvedRepo
  }
}
