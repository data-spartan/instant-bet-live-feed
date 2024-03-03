import { IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ResolvedGameDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  status: 'won' | 'lost';
}

export class ResolvedFixtureDto {
  @IsNumber()
  fixtureId: number;

  @IsString()
  status: 'In progress' | 'Ended';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResolvedFixtureDto)
  resolved: ResolvedFixtureDto[];
}

export class ResolvedFixturesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResolvedFixtureDto)
  resolved: ResolvedFixtureDto[];
}
