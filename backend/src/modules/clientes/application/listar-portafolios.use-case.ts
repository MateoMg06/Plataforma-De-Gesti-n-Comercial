import { Inject, Injectable } from '@nestjs/common';
import type { Portafolio } from '../domain/portafolio.js';
import {
  PORTAFOLIO_REPOSITORY,
  type PortafolioRepository,
} from '../domain/portafolio.repository.js';

// HU-09: catálogo de portafolio, ordenado por nombre.
@Injectable()
export class ListarPortafoliosUseCase {
  constructor(
    @Inject(PORTAFOLIO_REPOSITORY)
    private readonly portafolios: PortafolioRepository,
  ) {}

  ejecutar(): Promise<Portafolio[]> {
    return this.portafolios.listar();
  }
}
