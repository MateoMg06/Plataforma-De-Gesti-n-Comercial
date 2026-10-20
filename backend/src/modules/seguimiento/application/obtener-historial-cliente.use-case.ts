import { Injectable, Inject } from '@nestjs/common';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';
import { Seguimiento } from '../domain/seguimiento.js';

@Injectable()
export class ObtenerHistorialClienteUseCase {
  constructor(@Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository) {}

  async ejecutar(idCliente: number): Promise<Seguimiento[]> {
    return this.seguimientos.listar();
  }
}