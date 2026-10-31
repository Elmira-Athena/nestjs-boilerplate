import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean({ message: 'TASK-FIELD-0004' })
  isCompleted?: boolean;
}
