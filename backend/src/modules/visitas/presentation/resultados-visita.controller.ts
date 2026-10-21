import { Controller, Get } from '@nestjs/common';
import { ListarResultadosCatalogoUseCase } from '../application/listar-resultados-catalogo.use-case.js';

// Catálogo RESULTADO_VISITA: se consulta para elegir qué pasó en la visita (HU-19).
@Controller('resultados-visita')
export class ResultadosVisitaController {
  constructor(private readonly listarResultados: ListarResultadosCatalogoUseCase) {}

  @Get()
  listar() {
    return this.listarResultados.ejecutar();
  }
}
