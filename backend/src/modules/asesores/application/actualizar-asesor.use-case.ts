import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Asesor } from '../domain/asesor.js';
import {
  ASESOR_REPOSITORY,
  type AsesorRepository,
} from '../domain/asesor.repository.js';

@Injectable()
export class ActualizarAsesorUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  async ejecutar(
    id: number,
    nombre: string,
    correo: string,
    telefono: string,
  ): Promise<Asesor> {
    const asesor = await this.asesores.buscarPorId(id);
    if (!asesor) throw new NotFoundException(`No existe el asesor ${id}`);
    let actualizado: Asesor;
    try {
      actualizado = asesor.actualizar(nombre, correo, telefono);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    // El correo sigue siendo único: solo choca si es de OTRO asesor.
    const otro = await this.asesores.buscarPorCorreo(actualizado.correo);
    if (otro && otro.id !== id) {
      throw new ConflictException(
        `Ya existe un asesor con el correo ${actualizado.correo}`,
      );
    }
    return this.asesores.guardar(actualizado);
  }
}
