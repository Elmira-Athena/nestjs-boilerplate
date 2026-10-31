import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ type: String, example: 'Học NestJS cơ bản' })
  @IsNotEmpty({ message: 'TASK-FIELD-0001' })
  @IsString({ message: 'TASK-FIELD-0001' })
  @Length(1, 255, { message: 'TASK-FIELD-0001' })
  title: string;

  @ApiProperty({ type: String, example: 'Backend' })
  @IsNotEmpty({ message: 'TASK-FIELD-0002' })
  @IsString({ message: 'TASK-FIELD-0002' })
  @MaxLength(255, { message: 'TASK-FIELD-0002' })
  category: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Tìm hiểu về DTO, Controller, Service và Module',
  })
  @IsOptional()
  @IsString({ message: 'TASK-FIELD-0003' })
  description?: string;
}
