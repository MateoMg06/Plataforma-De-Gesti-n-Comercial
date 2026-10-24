import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Potencial } from '../domain/potencial.js';
import {
  POTENCIAL_REPOSITORY,
  type PotencialRepository,
} from '../domain/potencial.repository.js';

@Injectable()
export class EditarPotencialUseCase {
  constructor(
    @Inject(POTENCIAL_REPOSITORY)
    private readonly opciones: PotencialRepository,
  ) {}

  async ejecutar(
    id: number,
    nombre: string,
    orden: number,
  ): Promise<Potencial> {
    const actual = await this.opciones.buscarPorId(id);
    if (!actual) throw new NotFoundException('El potencial no existe');
    let opcion: Potencial;
    try {
      opcion = actual.editar(nombre, orden);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetida = await this.opciones.buscarPorNombre(opcion.nombre);
    if (repetida && repetida.id !== id)
      throw new ConflictException('Ya existe un potencial con ese nombre');
    return this.opciones.guardar(opcion);
  }
}
