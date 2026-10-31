import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from '@core/filters/global-exception-filter';
import { ProjectLogger } from '@core/loggers';
import { ConfigService } from '@nestjs/config';
import { requestLoggerMiddleware } from '@shared/middleware/request-logger.middleware';
import { setupSwagger } from './setup-swagger';
import { I18nMiddleware } from 'nestjs-i18n';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';

const logger = new ProjectLogger('bootstrap');

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );
  app.setGlobalPrefix('/api');
  app.use(requestLoggerMiddleware);
  // nestjs-i18n registers its middleware on '*path' (Nest 11 syntax), which never
  // matches on Nest 9/Express 4, leaving I18nContext undefined in exception filters
  const i18nMiddleware = app.get(I18nMiddleware);
  app.use(i18nMiddleware.use.bind(i18nMiddleware));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  const config = app.get<ConfigService>(ConfigService);
  // app.useGlobalFilters(new GlobalExceptionsFilter(config));

  await app.listen(config.get('PORT'), async () => {
    logger.info(`Application is running on: ${await app.getUrl()}`);
  });

  return app;
}
bootstrap();
