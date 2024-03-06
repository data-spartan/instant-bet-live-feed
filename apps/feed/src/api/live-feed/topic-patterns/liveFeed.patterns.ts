export enum LiveFeedRedisChannel {
  EVENT_NEW_FIXTURES = 'new_fixtures',
  EVENT_NEW_GAMES = 'new_games',
}

export enum LiveFeedTopicPatterns {
  LiveFeed = 'live_feed',
  LiveResolved = 'live_resolved',
  ResolveTickets = 'resolve_tickets',
  DlqResolved = 'dlq_resolved',
}
