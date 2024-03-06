import { Logger, Module } from '@nestjs/common';
import { MongooseService } from './mongodb/mongoose-service/mongoose.service';
import { KafkaApiModule } from '../kafka/kafkaApi.module';
import { MongooseQueriesLiveFeed } from '@feed/api/live-feed/queries/liveFeedService.queries';

@Module({
  imports: [KafkaApiModule],
  providers: [Logger, MongooseService, MongooseQueriesLiveFeed],

  exports: [MongooseService, MongooseQueriesLiveFeed],
})
export class DatabaseModule {}
