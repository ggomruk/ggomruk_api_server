import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ParameterRangeDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  min: number;

  @ApiProperty()
  @IsNumber()
  max: number;

  @ApiProperty()
  @IsNumber()
  step: number;
}

export class StrategyConfigDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ type: [ParameterRangeDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterRangeDTO)
  parameters: ParameterRangeDTO[];
}

export class OptimizeDTO {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  interval: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ type: [StrategyConfigDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyConfigDTO)
  strategies: StrategyConfigDTO[];
}
