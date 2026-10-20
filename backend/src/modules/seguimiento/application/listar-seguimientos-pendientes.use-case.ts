import { Inject, Injectable } from '@nestjs/common';
import type { Seguimiento } from '../domain/seguimiento.js';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';

@Injectable()
export class ListarSeguimientosPendientesUseCase {
  constructor(@Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository) {}

  async ejecutar(): Promise<Seguimiento[]> {
    return this.seguimientos.listar();
  }
}