import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config.js';
import { HealthController } from './shared/presentation/health.controller.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientesModule } from './modules/clientes/clientes.module.js';
import { VisitasModule } from './modules/visitas/visitas.module.js';
import { ZonasModule } from './modules/zonas/zonas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: databaseConfig }),
    // HU-01 (Kevin V): login y sesiones con BetterAuth bajo /api/auth/*.
    AuthModule,
    ZonasModule,
    ClientesModule,
    VisitasModule,
    // Cada épica registra aquí su módulo cuando lo cree.
  ],
  controllers: [HealthController],
})
export class AppModule {}
