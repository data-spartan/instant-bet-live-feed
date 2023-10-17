import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LiveFeedDocument = HydratedDocument<LiveFeed>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class LiveFeed {
  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  fixtureId: number;

  @Prop({ required: true })
  competitionString: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  regionId: number;

  @Prop({ required: true })
  sport: string;

  @Prop({ required: true })
  sportId: number;

  @Prop({ required: true })
  competition: string;

  @Prop({ required: true })
  competitionId: number;

  @Prop({ required: true })
  fixtureTimestamp: number;

  @Prop({ required: true })
  competitor1: string;

  @Prop({ required: true })
  competitor1Id: number;

  @Prop({ required: true })
  competitor2: string;

  @Prop({ required: true })
  competitor2Id: number;

  @Prop({ required: true })
  timeSent: number;

  @Prop({ type: [Object] })
  games: object[];

  @Prop({ type: [Object] })
  resolved: string[];
}

const LiveFeedSchema = SchemaFactory.createForClass(LiveFeed);

LiveFeedSchema.index({ fixtureId: 1 });
LiveFeedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

export { LiveFeedSchema };
