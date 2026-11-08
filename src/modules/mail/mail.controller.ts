import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendMailDto } from './dto/send-mail.dto';
import { MailExceptionFilter } from './mail-exception.filter';
import { MailService } from './mail.service';

@ApiTags('mail')
@Controller('v1/mail')
@UseFilters(MailExceptionFilter)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a notification email' })
  send(@Body() dto: SendMailDto) {
    return this.mailService.send(dto);
  }
}
