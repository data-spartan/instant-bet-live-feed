import {
  IsString,
  IsArray,
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
