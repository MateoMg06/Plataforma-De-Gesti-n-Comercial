import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Asesor } from '../domain/asesor.js';
import {
  ASESOR_REPOSITORY,
  type AsesorRepository,
} from '../domain/asesor.repository.js';

// Caso de uso exportado (HU-12): dado el usuario que inició sesión, devuelve su
// registro de asesor. La unión es la columna id_usuario de la tabla asesor.
@Injectable()
export class ObtenerAsesorPorUsuarioUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  async ejecutar(idUsuario: string): Promise<Asesor> {
    const asesor = await this.asesores.buscarPorIdUsuario(idUsuario);
    if (!asesor) {
      throw new NotFoundException('Tu usuario no está vinculado a ningún asesor');
    }
    return asesor;
  }
}
