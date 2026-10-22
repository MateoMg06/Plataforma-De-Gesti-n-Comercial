import { Module } from '@nestjs/common';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { VisitasModule } from '../visitas/visitas.module.js';
import { ObtenerMiAgendaUseCase } from './application/obtener-mi-agenda.use-case.js';
import { AgendaController } from './presentation/agenda.controller.js';

// Módulo de la agenda (HU-11 a HU-13, Mateo). No tiene tablas propias:
// importa los casos de uso que exportan asesores y visitas.
// Está aparte para evitar una dependencia circular (visitas ya importa asesores).
@Module({
  imports: [AsesoresModule, VisitasModule],
  controllers: [AgendaController],
  providers: [ObtenerMiAgendaUseCase],
})
export class AgendaModule {}
