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
  ): Promise<Asesor> {
    let asesor: Asesor;
    try {
      asesor = Asesor.crear(nombre, correo, telefono);
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
    return this.asesores.guardar(asesor);
  }
}
