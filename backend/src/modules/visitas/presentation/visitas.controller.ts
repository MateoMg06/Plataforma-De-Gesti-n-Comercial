import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ListarVisitasUseCase } from '../application/listar-visitas.use-case.js';
import { ProgramarVisitaUseCase } from '../application/programar-visita.use-case.js';
import { RegistrarResultadoVisitaUseCase } from '../application/registrar-resultado-visita.use-case.js';
import type { EstadoResultado } from '../domain/visita.js';
import { ProgramarVisitaDto } from './dto/programar-visita.dto.js';
import { RegistrarResultadoDto } from './dto/registrar-resultado.dto.js';

// Ejemplo de visita para la documentación.
const visitaEjemplo = {
  id: 1,
  idCliente: 1,
  idAsesor: 1,
  idRuta: null,
  fechaProgramada: '2026-10-26T14:00:00.000Z',
  estado: 'programada',
  fechaReal: null,
};

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
// Sin lógica de negocio aquí.
@ApiTags('Visitas')
@Controller('visitas')
export class VisitasController {
  constructor(
    private readonly programarVisita: ProgramarVisitaUseCase,
    private readonly listarVisitas: ListarVisitasUseCase,
    private readonly registrarResultado: RegistrarResultadoVisitaUseCase,
  ) {}

  // HU-03: con rol asesor solo devuelve sus visitas.
  @Get()
  @ApiOperation({ summary: 'Listar visitas', description: 'Con rol asesor devuelve solo sus visitas (HU-03).' })
  @ApiOkResponse({ description: 'Visitas.', schema: { example: [visitaEjemplo] } })
  listar(@Session() session: UserSession) {
    return this.listarVisitas.ejecutar({ id: session.user.id, role: session.user.role as string });
  }

  @Post()
  @ApiOperation({ summary: 'Programar una visita (HU-18)', description: 'Queda en estado programada.' })
  @ApiCreatedResponse({ description: 'Visita programada.', schema: { example: visitaEjemplo } })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiNotFoundResponse({ description: 'El cliente o el asesor no existen.' })
  programar(@Body() dto: ProgramarVisitaDto) {
    return this.programarVisita.ejecutar(
      dto.idCliente,
      dto.idAsesor,
      new Date(dto.fechaProgramada),
      dto.idRuta ?? null,
    );
  }

  // HU-19: registrar el resultado de una visita.
  @Post(':id/resultados')
  @ApiOperation({
    summary: 'Registrar el resultado de una visita (HU-19)',
    description: 'Fecha real, estado final y resultados del catálogo. Una visita realizada no se puede editar.',
  })
  @ApiCreatedResponse({ description: 'Visita con su resultado.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o la visita ya fue realizada.' })
  @ApiNotFoundResponse({ description: 'La visita no existe.' })
  registrar(@Param('id', ParseIntPipe) id: number, @Body() dto: RegistrarResultadoDto) {
    return this.registrarResultado.ejecutar(
      id,
      new Date(dto.fechaReal),
      dto.estado as EstadoResultado,
      dto.resultados,
    );
  }
}
