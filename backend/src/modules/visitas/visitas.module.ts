import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { ListarResultadosCatalogoUseCase } from './application/listar-resultados-catalogo.use-case.js';
import { ListarVisitasUseCase } from './application/listar-visitas.use-case.js';
import { ProgramarVisitaUseCase } from './application/programar-visita.use-case.js';
import { RegistrarResultadoVisitaUseCase } from './application/registrar-resultado-visita.use-case.js';
import { VISITA_REPOSITORY } from './domain/visita.repository.js';
import { ResultadoVisitaOrmEntity } from './infrastructure/resultado-visita.orm-entity.js';
import { TypeOrmVisitaRepository } from './infrastructure/typeorm-visita.repository.js';
import { VisitaOrmEntity } from './infrastructure/visita.orm-entity.js';
import { VisitaResultadoOrmEntity } from './infrastructure/visita-resultado.orm-entity.js';
import { ResultadosVisitaController } from './presentation/resultados-visita.controller.js';
import { VisitasController } from './presentation/visitas.controller.js';

@Module({
  // ClientesModule y AsesoresModule exportan los casos de uso para validar
  // que el cliente y el asesor existen al programar.
  imports: [
    ClientesModule,
    AsesoresModule,
    TypeOrmModule.forFeature([VisitaOrmEntity, ResultadoVisitaOrmEntity, VisitaResultadoOrmEntity]),
  ],
  controllers: [VisitasController, ResultadosVisitaController],
  providers: [
    ProgramarVisitaUseCase,
    ListarVisitasUseCase,
    RegistrarResultadoVisitaUseCase,
    ListarResultadosCatalogoUseCase,
    // Aquí se conecta el puerto con su adaptador. Cambiar de BD = cambiar esta línea.
    { provide: VISITA_REPOSITORY, useClass: TypeOrmVisitaRepository },
  ],
  // Andres (HU-16) y Mateo (agenda) importan estos casos de uso desde su módulo.
  exports: [ProgramarVisitaUseCase, ListarVisitasUseCase],
})
export class VisitasModule {}
