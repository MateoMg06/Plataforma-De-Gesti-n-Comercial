import { Module } from '@nestjs/common';
// Módulo de NestJS para el funcionalidad de seguimientos.
// Agrega: controlador, caso de uso, repositorio TypeORM y entidad ORM.
// Registrar en app.module.ts para que esté disponible en toda la aplicación.
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module.js';
import { VentasModule } from '../ventas/ventas.module.js';
import { VisitasModule } from '../visitas/visitas.module.js';
import { CompletarSeguimientoUseCase } from './application/completar-seguimiento.use-case.js';
import { CrearSeguimientoUseCase } from './application/crear-seguimiento.use-case.js';
import { ListarSeguimientosPendientesUseCase } from './application/listar-seguimientos-pendientes.use-case.js';
import { ObtenerHistorialClienteUseCase } from './application/obtener-historial-cliente.use-case.js';
import { TypeOrmSeguimientoRepository } from './infrastructure/typeorm-seguimiento.repository.js';
import { SEGUIMIENTO_REPOSITORY } from './domain/seguimiento.repository.js';
import { SeguimientoOrmEntity } from './infrastructure/seguimiento.orm-entity.js';
import { SeguimientosController } from './presentation/seguimientos.controller.js';

@Module({
  // HU-26: el historial usa los casos de uso que exportan clientes, visitas y ventas.
  imports: [TypeOrmModule.forFeature([SeguimientoOrmEntity]), ClientesModule, VisitasModule, VentasModule],
  controllers: [SeguimientosController],
  providers: [
    CrearSeguimientoUseCase,
    CompletarSeguimientoUseCase,
    ListarSeguimientosPendientesUseCase,
    ObtenerHistorialClienteUseCase,
    // Aquí se conecta el puerto con su adaptador. Cambiar de BD = cambiar esta línea.
    { provide: SEGUIMIENTO_REPOSITORY, useClass: TypeOrmSeguimientoRepository },
  ],
})
export class SeguimientoModule {}