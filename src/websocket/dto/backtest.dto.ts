import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BacktestDTO as ApiBacktestDto } from 'src/algo/dto/backtest.dto';

export class BacktestDTO {
  @IsNotEmpty()
  @IsString()
  task: string;

  @IsString()
  uid: string;

  @ValidateNested()
  @Type(() => ApiBacktestDto)
  params: ApiBacktestDto;

  constructor(task: string, uid: string, params: ApiBacktestDto) {
    this.task = task;
    this.uid = uid;
    this.params = params;
  }

  public static fromApiBacktestDto(
    task: string,
    uid: string,
    params: ApiBacktestDto,
  ) {
    return new BacktestDTO(task, uid, params);
  }
}
