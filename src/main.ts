/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PhotoConfig } from 'config/photo.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(PhotoConfig.destination, {
    prefix: PhotoConfig.urlPrefix,
    maxAge: 60 * 60 * 24 * 30
  })

  app.enableCors();
  
  await app.listen(3000);
}
bootstrap();
