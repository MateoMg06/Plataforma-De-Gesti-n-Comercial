import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Asesor } from '../domain/asesor.js';
import {
  ASESOR_REPOSITORY,
  type AsesorRepository,
} from '../domain/asesor.repository.js';

// Caso de uso exportado: rutas, visitas y ventas lo usan para consultar un asesor
// sin tocar el repositorio de este módulo.
@Injectable()
export class ObtenerAsesorUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  async ejecutar(id: number): Promise<Asesor> {
    const asesor = await this.asesores.buscarPorId(id);
    if (!asesor) {
      throw new NotFoundException(`No existe el asesor ${id}`);
    }
    return asesor;
  }
}
