import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FilterTaskDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  // Query strings arrive as 'true'/'false'; anything else is left for IsBoolean to reject
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'TASK-FIELD-0004' })
  isCompleted?: boolean;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString({ message: 'TASK-FIELD-0002' })
  category?: string;
}
