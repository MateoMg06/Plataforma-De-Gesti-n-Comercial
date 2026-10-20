import { Inject, Injectable } from '@nestjs/common';
import type { Zona } from '../domain/zona.js';
import { ZONA_REPOSITORY, type ZonaRepository } from '../domain/zona.repository.js';

@Injectable()
export class ListarZonasUseCase {
  constructor(@Inject(ZONA_REPOSITORY) private readonly zonas: ZonaRepository) {}

  ejecutar(): Promise<Zona[]> {
    return this.zonas.listar();
  }
}
