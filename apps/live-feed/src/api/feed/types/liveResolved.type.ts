export type ResolvedType = {
  id: string;
  type: string;
  status: 'won' | 'lost';
};

export type LiveResolvedType = {
  fixtureId: number;
  status: 'In progress' | 'Ended';
  resolved: ResolvedType[];
};

export type ResolvedArrayType = LiveResolvedType[];
