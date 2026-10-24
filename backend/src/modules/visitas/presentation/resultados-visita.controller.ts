import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarResultadosCatalogoUseCase } from '../application/listar-resultados-catalogo.use-case.js';

// Catálogo RESULTADO_VISITA: se consulta para elegir qué pasó en la visita (HU-19).
@ApiTags('Visitas')
@Controller('resultados-visita')
export class ResultadosVisitaController {
  constructor(private readonly listarResultados: ListarResultadosCatalogoUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Catálogo de resultados de visita' })
  @ApiOkResponse({ schema: { example: [{ id: 1, nombre: 'Visita comercial' }, { id: 2, nombre: 'Cobro' }] } })
  listar() {
    return this.listarResultados.ejecutar();
  }
}
