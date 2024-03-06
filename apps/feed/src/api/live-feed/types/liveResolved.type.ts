export enum ResolvedFixtureStatus {
  IN_PROGRESS = 'In progress',
  ENDED = 'Ended',
}

export enum ResolvedGameStatus {
  WON = 'won',
  LOST = 'lost',
}

export type ResolvedType = {
  id: string;
  type: string;
  status: ResolvedGameStatus.WON | ResolvedGameStatus.LOST;
};

export type LiveResolvedType = {
  fixtureId: number;
  status: ResolvedFixtureStatus.IN_PROGRESS | ResolvedFixtureStatus.ENDED;
  resolved: ResolvedType[];
};

export type ResolvedArrayType = LiveResolvedType[];
