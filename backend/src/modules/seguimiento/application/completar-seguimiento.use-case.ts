import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Seguimiento } from '../domain/seguimiento.js';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';

// HU-24: marcar un seguimiento como completado, guardando la fecha y quién lo hizo.
@Injectable()
export class CompletarSeguimientoUseCase {
  constructor(@Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository) {}

  async ejecutar(id: number, idUsuario: string): Promise<Seguimiento> {
    const seguimiento = await this.seguimientos.buscarPorId(id);
    if (!seguimiento) {
      throw new NotFoundException(`No existe el seguimiento ${id}`);
    }
    let completado: Seguimiento;
    try {
      completado = seguimiento.completar(idUsuario, new Date());
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.seguimientos.guardar(completado);
  }
}
