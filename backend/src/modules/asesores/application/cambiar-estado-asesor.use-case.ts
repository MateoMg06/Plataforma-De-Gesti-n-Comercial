import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AsesorEstado } from '../../../common/enums/domain.enums.js';
import type { Asesor } from '../domain/asesor.js';
import {
  ASESOR_REPOSITORY,
  type AsesorRepository,
} from '../domain/asesor.repository.js';

// En vez de borrar, el asesor se inactiva: rutas y visitas viejas siguen apuntando a él.
@Injectable()
export class CambiarEstadoAsesorUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  async ejecutar(id: number, estado: AsesorEstado): Promise<Asesor> {
    const asesor = await this.asesores.buscarPorId(id);
    if (!asesor) throw new NotFoundException(`No existe el asesor ${id}`);
    return this.asesores.guardar(asesor.cambiarEstado(estado));
  }
}
