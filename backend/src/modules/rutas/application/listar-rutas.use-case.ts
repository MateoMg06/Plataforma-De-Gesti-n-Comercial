import { Inject, Injectable } from '@nestjs/common';
import type { Ruta } from '../domain/ruta.js';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

@Injectable()
export class ListarRutasUseCase {
  constructor(@Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository) {}

  ejecutar(): Promise<Ruta[]> {
    return this.rutas.listar();
  }
}
