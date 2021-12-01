/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ReactConfig } from 'config/react.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(ReactConfig.destination, {
    prefix: ReactConfig.prefix
  })

  app.enableCors();
  
  await app.listen(3000);
}
bootstrap();
