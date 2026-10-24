import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Asesor } from '../domain/asesor.js';
import {
  ASESOR_REPOSITORY,
  type AsesorRepository,
} from '../domain/asesor.repository.js';

@Injectable()
export class RegistrarAsesorUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  async ejecutar(
    nombre: string,
    correo: string,
    telefono: string,
    idUsuario: string | null = null,
  ): Promise<Asesor> {
    let asesor: Asesor;
    try {
      asesor = Asesor.crear(nombre, correo, telefono, idUsuario);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    // HU-10: el correo es único. Necesita consultar la base, por eso va aquí y no en la entidad.
    if (await this.asesores.buscarPorCorreo(asesor.correo)) {
      throw new ConflictException(
        `Ya existe un asesor con el correo ${asesor.correo}`,
      );
    }
    // HU-12: un usuario solo puede estar vinculado a un asesor (si no, "Mi agenda" no sabría cuál mostrar).
    if (asesor.idUsuario) {
      const vinculado = await this.asesores.buscarPorIdUsuario(asesor.idUsuario);
      if (vinculado) {
        throw new ConflictException(`Ese usuario ya está vinculado al asesor ${vinculado.nombre}`);
      }
    }
    return this.asesores.guardar(asesor);
  }
}
