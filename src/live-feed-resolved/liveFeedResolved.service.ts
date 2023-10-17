import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LiveFeed,
  LiveFeedDocument,
} from 'src/database/schemas/liveFeed.schema';

@Injectable()
export class LiveFeedResolvedService {
  constructor(
    @InjectModel(LiveFeed.name)
    private readonly liveFeedModel: Model<LiveFeedDocument>,
  ) {}
  insertFeed(feed: any) {
    const updateArr = feed.map((obj) => ({
      updateOne: {
        filter: {
          fixtureId: obj.fixtureId,
        },

        update: {
          $setOnInsert: {
            source: obj.source,
            type: obj.type,
            fixtureId: obj.fixtureId,
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
            games: obj.games,
            resolved: obj.resolved,
            timeSent: obj.time,
          },
        },

        upsert: true,
        // setDefaultsOnInsert: true,
      },
    }));
    this.liveFeedModel.bulkWrite(updateArr);
  }
}
