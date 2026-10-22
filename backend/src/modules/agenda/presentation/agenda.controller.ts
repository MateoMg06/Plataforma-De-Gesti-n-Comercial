import { Controller, Get } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ObtenerMiAgendaUseCase } from '../application/obtener-mi-agenda.use-case.js';

// Presentación: toma el usuario de la sesión (BetterAuth) y delega en el caso de uso.
@ApiTags('Agenda')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly obtenerMiAgenda: ObtenerMiAgendaUseCase) {}

  // HU-12: GET /api/agenda/mia devuelve las visitas del asesor que inició sesión.
  @Get('mia')
  @ApiOperation({
    summary: 'Mi agenda (HU-12)',
    description: 'Visitas del asesor que inició sesión. El usuario se une a su asesor por id_usuario.',
  })
  @ApiOkResponse({ description: 'Visitas del asesor.' })
  @ApiNotFoundResponse({ description: 'El usuario no está vinculado a ningún asesor.' })
  miAgenda(@Session() session: UserSession) {
    return this.obtenerMiAgenda.ejecutar(session.user.id);
  }
}
