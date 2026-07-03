import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from 'src/shared/filters/http-exception.filter';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();

  await app.listen(8080);
}
bootstrap();
