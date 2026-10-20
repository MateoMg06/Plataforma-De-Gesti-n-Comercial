import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config.js';
import { HealthController } from './shared/presentation/health.controller.js';
import { ZonasModule } from './modules/zonas/zonas.module.js';
import { SeguimientoModule } from './modules/seguimiento/seguimiento.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: databaseConfig }),
    ZonasModule,
    SeguimientoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
