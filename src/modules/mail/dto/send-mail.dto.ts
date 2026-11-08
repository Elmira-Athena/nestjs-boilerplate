import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { MailProvider } from '../mail-provider.enum';

export class SendMailDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Thông báo bài tập OOP' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'subject must not be blank' })
  subject: string;

  @ApiProperty({ example: 'Bạn đã hoàn thành bài tập.' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'content must not be blank' })
  content: string;

  @ApiPropertyOptional({ enum: MailProvider })
  @IsOptional()
  @IsEnum(MailProvider)
  provider?: MailProvider;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHtml?: boolean;
}
