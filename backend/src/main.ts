import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { swaggerConfiguration } from './config/swagger.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  swaggerConfiguration(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
