// games.dto.ts
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
  IsDate,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class GamesDto {
  @IsNumber()
  OddsTypeName: number;

  @IsNumber()
  quote: number;

  @IsNumber()
  sourceGameId: number;

  @IsBoolean()
  locked: boolean;

  @IsString()
  type: string;
}

export class FixtureDto {
  @IsNumber()
  fixtureId: number;

  @IsString()
  source: string;

  @IsString()
  type: string;

  @IsString()
  competitionString: string;

  @IsString()
  region: string;

  @IsNumber()
  regionId: number;

  @IsString()
  sport: string;

  @IsNumber()
  sportId: number;

  @IsString()
  competition: string;

  @IsNumber()
  competitionId: number;

  @IsNumber()
  fixtureTimestamp: number;

  @IsString()
  competitor1: string;

  @IsString()
  competitor1Id: string;

  @IsString()
  competitor2: string;

  @IsString()
  competitor2Id: string;

  @IsObject()
  @IsOptional()
  scoreboard?: object;

  @ValidateNested({ each: true })
  @Type(() => GamesDto)
  @IsOptional()
  games?: GamesDto[];

  @IsDate()
  sentTime: Date;
}

export class FixturesArrayDto {
  @ValidateNested({ each: true })
  @Type(() => FixtureDto)
  @IsArray()
  fixtures: FixtureDto[];
}
