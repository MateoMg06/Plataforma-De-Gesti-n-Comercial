import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module.js';
import { ListarVisitasUseCase } from './application/listar-visitas.use-case.js';
import { ProgramarVisitaUseCase } from './application/programar-visita.use-case.js';
import { VISITA_REPOSITORY } from './domain/visita.repository.js';
import { TypeOrmVisitaRepository } from './infrastructure/typeorm-visita.repository.js';
import { VisitaOrmEntity } from './infrastructure/visita.orm-entity.js';
import { VisitasController } from './presentation/visitas.controller.js';

@Module({
  // ClientesModule exporta ObtenerClienteUseCase para validar clientes al programar.
  imports: [ClientesModule, TypeOrmModule.forFeature([VisitaOrmEntity])],
  controllers: [VisitasController],
  providers: [
    ProgramarVisitaUseCase,
    ListarVisitasUseCase,
    // Aquí se conecta el puerto con su adaptador. Cambiar de BD = cambiar esta línea.
    { provide: VISITA_REPOSITORY, useClass: TypeOrmVisitaRepository },
  ],
  // Andres (HU-16) y Mateo (agenda) importan estos casos de uso desde su módulo.
  exports: [ProgramarVisitaUseCase, ListarVisitasUseCase],
})
export class VisitasModule {}
