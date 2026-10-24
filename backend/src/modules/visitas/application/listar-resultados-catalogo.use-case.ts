import { Inject, Injectable } from '@nestjs/common';
import type { ResultadoVisita } from '../domain/resultado-visita.js';
import { VISITA_REPOSITORY, type VisitaRepository } from '../domain/visita.repository.js';

// Lista el catálogo RESULTADO_VISITA para que el usuario elija al registrar el resultado.
@Injectable()
export class ListarResultadosCatalogoUseCase {
  constructor(@Inject(VISITA_REPOSITORY) private readonly visitas: VisitaRepository) {}

  ejecutar(): Promise<ResultadoVisita[]> {
    return this.visitas.listarResultadosCatalogo();
  }
}
