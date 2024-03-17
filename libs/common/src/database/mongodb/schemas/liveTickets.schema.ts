import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { LiveFeed } from './liveFeed.schema';
import * as mongoose from 'mongoose';

export type LiveTicketsDocument = mongoose.HydratedDocument<LiveTickets>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class LiveTickets {
  // @Prop({ required: true })
  // fixtureId: number;
  @Prop({ schema: LiveFeed, type: Number, ref: 'LiveFeed' })
  fixtureId: number;

  @Prop({ type: [Object] })
  resolved: object[];

  @Prop({ type: String })
  status: string;
}

const LiveTicketsSchema = SchemaFactory.createForClass(LiveTickets);

// LiveFeedResolvedSchema.index({ fixtureId: 1 });
// LiveTicketsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

export { LiveTicketsSchema };
