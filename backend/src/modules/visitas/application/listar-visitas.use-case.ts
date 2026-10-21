import { Inject, Injectable } from '@nestjs/common';
import type { Visita } from '../domain/visita.js';
import { VISITA_REPOSITORY, type VisitaRepository } from '../domain/visita.repository.js';

@Injectable()
export class ListarVisitasUseCase {
  constructor(@Inject(VISITA_REPOSITORY) private readonly visitas: VisitaRepository) {}

  ejecutar(): Promise<Visita[]> {
    return this.visitas.listar();
  }
}
