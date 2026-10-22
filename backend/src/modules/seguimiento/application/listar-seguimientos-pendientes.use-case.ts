import { Inject, Injectable } from '@nestjs/common';
import type { Seguimiento } from '../domain/seguimiento.js';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';

@Injectable()
export class ListarSeguimientosPendientesUseCase {
  constructor(@Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository) {}

  // Pendientes = los que aún no se han completado (ya vienen ordenados por fecha_proxima).
  async ejecutar(): Promise<Seguimiento[]> {
    const todos = await this.seguimientos.listar();
    return todos.filter((s) => !s.completado);
  }
}