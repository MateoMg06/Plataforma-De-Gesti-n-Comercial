import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module.js';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { BitacoraModule } from '../bitacora/bitacora.module.js';
import { CotizacionOrmEntity } from './infrastructure/cotizacion.orm-entity.js';
import { CotizacionDetalleOrmEntity } from './infrastructure/cotizacion-detalle.orm-entity.js';
import { TypeOrmCotizacionRepository } from './infrastructure/typeorm-cotizacion.repository.js';
import { COTIZACION_REPOSITORY } from './domain/cotizacion.repository.js';
import { CrearCotizacionUseCase } from './application/crear-cotizacion.use-case.js';
import { EnviarCotizacionUseCase } from './application/enviar-cotizacion.use-case.js';
import { AprobarCotizacionUseCase } from './application/aprobar-cotizacion.use-case.js';
import { RechazarCotizacionUseCase } from './application/rechazar-cotizacion.use-case.js';
import { CotizacionesController } from './presentation/cotizaciones.controller.js';

@Module({
  imports: [
    ClientesModule,
    AsesoresModule,
    // La bitácora es transversal: el interceptor global registra las
    // acciones que el controlador marca con @RegistrarEnBitacora.
    BitacoraModule,
    TypeOrmModule.forFeature([CotizacionOrmEntity, CotizacionDetalleOrmEntity]),
  ],
  controllers: [CotizacionesController],
  providers: [
    CrearCotizacionUseCase,
    EnviarCotizacionUseCase,
    AprobarCotizacionUseCase,
    RechazarCotizacionUseCase,
    { provide: COTIZACION_REPOSITORY, useClass: TypeOrmCotizacionRepository },
  ],
})
export class VentasModule {}
