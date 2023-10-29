import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { LiveFeed, LiveFeedDocument, LiveFeedSchema } from './liveFeed.schema';
import * as mongoose from 'mongoose';

export type LiveFeedResolvedDocument =
  mongoose.HydratedDocument<LiveFeedResolved>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class LiveFeedResolved {
  // @Prop({ required: true })
  // fixtureId: number;
  @Prop({ type: Number, ref: 'LiveFeed' })
  _id: number;

  @Prop({ type: [Object] })
  resolved: Object[];

  @Prop({ type: String })
  status: string;
}

const LiveFeedResolvedSchema = SchemaFactory.createForClass(LiveFeedResolved);

// LiveFeedResolvedSchema.index({ fixtureId: 1 });
// LiveFeedResolvedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

export { LiveFeedResolvedSchema };
