import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AuthController } from './modules/auth/auth.controller';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiConfigService } from '@shared/services/api-config.service';
import { SharedModule } from '@shared/services/shared.module';
import { MediaModule } from './modules/media/media.module';
import { JwtService } from '@nestjs/jwt';
import { AdminModule } from './modules/admin/admin.module';
import { APP_FILTER } from '@nestjs/core';
import { BadRequestExceptionFilter } from '@core/filters/bad-request.filter';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { ForbiddenExceptionFilter } from '@core/filters/forbidden.filter';
import { UnauthorizedExceptionFilter } from '@core/filters/unauthorized.filter';
import { ConflictExceptionFilter } from '@core/filters/conflict-exeption.filter';
import { InternalServerErrorExceptionFilter } from '@core/filters/internal-server-error.filter';
import { NotFoundExceptionFilter } from '@core/filters/not-found.filter';
import { UnprocessableEntityExceptionFilter } from '@core/filters/unprocess-entity.filter';
import { OrderModule } from '@modules/order/order.module';
import { PostModule } from '@modules/post/post.module';
import { TaskModule } from '@modules/task/task.module';
import { MailModule } from '@modules/mail/mail.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    MediaModule,
    UserModule,
    OrderModule,
    PostModule,
    TaskModule,
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService, ConfigService],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      fallbacks: {
        en: 'en',
        vi: 'vi',
      },
      loaderOptions: {
        path: path.join(__dirname, '../src/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ConflictExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ForbiddenExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnprocessableEntityExceptionFilter,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
