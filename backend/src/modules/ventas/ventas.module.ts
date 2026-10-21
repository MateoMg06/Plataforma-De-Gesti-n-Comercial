import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module.js';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { CotizacionOrmEntity } from './infrastructure/cotizacion.orm-entity.js';
import { CotizacionDetalleOrmEntity } from './infrastructure/cotizacion-detalle.orm-entity.js';
import { TypeOrmCotizacionRepository } from './infrastructure/typeorm-cotizacion.repository.js';
import { COTIZACION_REPOSITORY } from './domain/cotizacion.repository.js';
import { CrearCotizacionUseCase } from './application/crear-cotizacion.use-case.js';
import { CotizacionesController } from './presentation/cotizaciones.controller.js';

@Module({
  imports: [
    ClientesModule,
    AsesoresModule,
    TypeOrmModule.forFeature([CotizacionOrmEntity, CotizacionDetalleOrmEntity]),
  ],
  controllers: [CotizacionesController],
  providers: [
    CrearCotizacionUseCase,
    { provide: COTIZACION_REPOSITORY, useClass: TypeOrmCotizacionRepository },
  ],
})
export class VentasModule {}
