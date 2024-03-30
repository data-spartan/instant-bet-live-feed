import {
  IsString,
  IsNumber,
  ValidateNested,
  IsOptional,
  IsEnum,
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

  @IsEnum(ResolvedGameStatus)
  status: ResolvedGameStatus;
}

export class ResolvedFixtureDto {
  @IsNumber()
  fixtureId: number;

  @IsEnum(ResolvedFixtureStatus)
  status: ResolvedFixtureStatus;

  @ValidateNested({ each: true })
  @Type(() => ResolvedGameDto)
  @IsOptional()
  resolved: ResolvedGameDto[];
}

export class ResolvedFixturesDto {
  @ValidateNested({ each: true })
  @Type(() => ResolvedFixtureDto)
  resolved: ResolvedFixtureDto[];
}
