import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { swaggerConfiguration } from './config/swagger.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // bodyParser: false es requisito de la integración de BetterAuth con NestJS
  // (@thallesp/nestjs-better-auth): BetterAuth necesita leer el body crudo.
  // La propia librería vuelve a agregar el body parser para las rutas normales.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
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
