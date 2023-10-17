import { Module } from '@nestjs/common';
import { LiveFeedModule } from './live-feed/liveFeed.module';

import { AppService } from './app.service';
// import { LiveFeedController } from './live-feed/liveFeed.controller';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveFeedResolvedModule } from './live-feed-resolved/liveFeedResolved.module';

@Module({
  imports: [
    LiveFeedModule,
    MongooseModule.forRoot('mongodb://localhost/live-feed'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
