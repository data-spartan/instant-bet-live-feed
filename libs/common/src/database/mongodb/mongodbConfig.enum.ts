export enum MongodbConfigEnum {
  MONGODB_URL = 'MONGODB_URL',
  MONGODB_PORT = 'MONGODB_PORT',
  MONGODB_NAME = 'MONGODB_NAME',
  MONGODB_USERNAME = 'MONGODB_USERNAME',
  MONGODB_PASSWORD = 'MONGODB_PASSWORD',
}

export enum MongodbCollectionsEnum {
  LIVE_FEED = 'livefeed.feed',
  LIVE_FEED_RESOLVED = 'livefeed.resolved',
  LIVE_FEED_DLQ_RESOLVED = 'dlq.resolved',
}
