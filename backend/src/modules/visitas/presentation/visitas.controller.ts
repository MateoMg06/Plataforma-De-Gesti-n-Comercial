import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ListarVisitasUseCase } from '../application/listar-visitas.use-case.js';
import { ProgramarVisitaUseCase } from '../application/programar-visita.use-case.js';
import { RegistrarResultadoVisitaUseCase } from '../application/registrar-resultado-visita.use-case.js';
import type { EstadoResultado } from '../domain/visita.js';
import { ProgramarVisitaDto } from './dto/programar-visita.dto.js';
import { RegistrarResultadoDto } from './dto/registrar-resultado.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
// Sin lógica de negocio aquí.
// Cuando HU-02/HU-03 estén listas, agregar el guard de sesión y los roles.
@Controller('visitas')
export class VisitasController {
  constructor(
    private readonly programarVisita: ProgramarVisitaUseCase,
    private readonly listarVisitas: ListarVisitasUseCase,
    private readonly registrarResultado: RegistrarResultadoVisitaUseCase,
  ) {}

  @Get()
  listar() {
    return this.listarVisitas.ejecutar();
  }

  @Post()
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
  registrar(@Param('id', ParseIntPipe) id: number, @Body() dto: RegistrarResultadoDto) {
    return this.registrarResultado.ejecutar(
      id,
      new Date(dto.fechaReal),
      dto.estado as EstadoResultado,
      dto.resultados,
    );
  }
}
