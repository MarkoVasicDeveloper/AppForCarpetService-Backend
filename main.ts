import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from 'src/shared/filters/http-exception.filter';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Carpet Cleaning Service API')
    .setDescription(
      'The core API documentation for the Carpet Cleaning Service backend application',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(8080);
}
bootstrap();
