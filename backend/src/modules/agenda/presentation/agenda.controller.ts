import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { RegistrarEnBitacora } from '../../bitacora/infrastructure/bitacora.decorator.js';
import { ReprogramarVisitaUseCase } from '../../visitas/application/reprogramar-visita.use-case.js';
import { ObtenerMiAgendaUseCase } from '../application/obtener-mi-agenda.use-case.js';
import { ReprogramarVisitaDto } from './dto/reprogramar-visita.dto.js';

// Presentación: toma el usuario de la sesión (BetterAuth) y delega en los casos de uso.
@ApiTags('Agenda')
@Controller('agenda')
export class AgendaController {
  constructor(
    private readonly obtenerMiAgenda: ObtenerMiAgendaUseCase,
    private readonly reprogramarVisita: ReprogramarVisitaUseCase,
  ) {}

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

  // HU-13: reprogramar una visita desde la agenda. Queda registrado en la bitácora.
  @Patch('visitas/:id/reprogramar')
  @RegistrarEnBitacora('reprogramar_visita')
  @ApiOperation({
    summary: 'Reprogramar una visita (HU-13)',
    description:
      'Cambia la fecha programada indicando el motivo. Solo visitas pendientes. El asesor solo reprograma las suyas. Queda en la bitácora.',
  })
  @ApiOkResponse({ description: 'Visita reprogramada (estado reprogramada).' })
  @ApiBadRequestResponse({ description: 'Fecha o motivo inválidos, o la visita ya no está pendiente.' })
  @ApiForbiddenResponse({ description: 'La visita es de otro asesor.' })
  @ApiNotFoundResponse({ description: 'La visita no existe.' })
  reprogramar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReprogramarVisitaDto,
    @Session() session: UserSession,
  ) {
    return this.reprogramarVisita.ejecutar(id, new Date(dto.fechaProgramada), dto.motivo, {
      id: session.user.id,
      role: session.user.role as string,
    });
  }
}
