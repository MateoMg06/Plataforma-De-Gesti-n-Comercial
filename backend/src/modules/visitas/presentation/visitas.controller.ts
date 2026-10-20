import { Body, Controller, Get, Post } from '@nestjs/common';
import { ListarVisitasUseCase } from '../application/listar-visitas.use-case.js';
import { ProgramarVisitaUseCase } from '../application/programar-visita.use-case.js';
import { ProgramarVisitaDto } from './dto/programar-visita.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
// Sin lógica de negocio aquí.
// Cuando HU-02/HU-03 estén listas, agregar el guard de sesión y los roles.
@Controller('visitas')
export class VisitasController {
  constructor(
    private readonly programarVisita: ProgramarVisitaUseCase,
    private readonly listarVisitas: ListarVisitasUseCase,
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
}
