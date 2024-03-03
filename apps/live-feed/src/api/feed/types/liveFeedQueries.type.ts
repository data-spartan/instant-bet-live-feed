import { Mongoose, Query } from 'mongoose';

export type LiveFeedQueriesType = {
  queries: Object[];
  query?: Object;
  toResolveTickets?: number[];
  ids?: number[];
};
