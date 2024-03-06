import {
  IsString,
  IsArray,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ResolvedFixtureStatus,
  ResolvedGameStatus,
} from '../types/liveResolved.type';

export class ResolvedGameDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  status: ResolvedGameStatus;
}

export class ResolvedFixtureDto {
  @IsNumber()
  fixtureId: number;

  @IsString()
  status: ResolvedFixtureStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResolvedFixtureDto)
  @IsOptional()
  resolved: ResolvedFixtureDto[];
}

export class ResolvedFixturesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResolvedFixtureDto)
  resolved: ResolvedFixtureDto[];
}
