import { Injectable } from '@nestjs/common';

@Injectable()
export class LiveFeedQueries {
  public async insertFeedQueries(feed: any) {
    const queries = feed.map((obj) => ({
      updateOne: {
        filter: {
          _d: obj.fixtureId,
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
    return queries;
  }

  public async insertResolvedQuery(resolvedData: any) {
    const toResolveTickets = [];
    const queries = resolvedData.map((obj) => ({
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
    return { queries, toResolveTickets };
  }

  public async insertDlqResolvedQuery(resolvedDlq: any) {
    const queries = resolvedDlq.map((obj) => ({
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
    return queries;
  }
}
