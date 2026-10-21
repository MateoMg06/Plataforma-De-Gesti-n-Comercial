import { Controller, Get } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ObtenerMiAgendaUseCase } from '../application/obtener-mi-agenda.use-case.js';

// Presentación: toma el usuario de la sesión (BetterAuth) y delega en el caso de uso.
@Controller('agenda')
export class AgendaController {
  constructor(private readonly obtenerMiAgenda: ObtenerMiAgendaUseCase) {}

  // HU-12: GET /api/agenda/mia devuelve las visitas del asesor que inició sesión.
  @Get('mia')
  miAgenda(@Session() session: UserSession) {
    return this.obtenerMiAgenda.ejecutar(session.user.id);
  }
}
