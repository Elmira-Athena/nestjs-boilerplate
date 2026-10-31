import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ type: String, example: 'My first post' })
  @IsNotEmpty({ message: 'POST-FIELD-0001' })
  @IsString({ message: 'POST-FIELD-0001' })
  title: string;

  @ApiProperty({ type: String, example: 'News' })
  @IsNotEmpty({ message: 'POST-FIELD-0002' })
  @IsString({ message: 'POST-FIELD-0002' })
  category: string;

  @ApiProperty({ type: String, example: 'Hello world' })
  @IsNotEmpty({ message: 'POST-FIELD-0003' })
  @IsString({ message: 'POST-FIELD-0003' })
  description: string;
}
