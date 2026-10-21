import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config.js';
import { HealthController } from './shared/presentation/health.controller.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientesModule } from './modules/clientes/clientes.module.js';
import { VisitasModule } from './modules/visitas/visitas.module.js';
import { RutasModule } from './modules/rutas/rutas.module.js';
import { AsesoresModule } from './modules/asesores/asesores.module.js';
import { ZonasModule } from './modules/zonas/zonas.module.js';
import { SeguimientoModule } from './modules/seguimiento/seguimiento.module.js';
import { BitacoraModule } from './modules/bitacora/bitacora.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: databaseConfig }),
    // HU-01 (Kevin V): login y sesiones con BetterAuth bajo /api/auth/*.
    AuthModule,
    ZonasModule,
    ClientesModule,
    VisitasModule,
    RutasModule,
    AsesoresModule,
    SeguimientoModule,
    BitacoraModule,
    // Cada épica registra aquí su módulo cuando lo cree.
  ],
  controllers: [HealthController],
})
export class AppModule {}
