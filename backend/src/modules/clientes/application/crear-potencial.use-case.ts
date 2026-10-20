import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Potencial } from '../domain/potencial.js';
import {
  POTENCIAL_REPOSITORY,
  type PotencialRepository,
} from '../domain/potencial.repository.js';

@Injectable()
export class CrearPotencialUseCase {
  constructor(
    @Inject(POTENCIAL_REPOSITORY)
    private readonly opciones: PotencialRepository,
  ) {}

  async ejecutar(nombre: string, orden: number): Promise<Potencial> {
    let opcion: Potencial;
    try {
      opcion = Potencial.crear(nombre, orden);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetida = await this.opciones.buscarPorNombre(opcion.nombre);
    if (repetida)
      throw new ConflictException('Ya existe un potencial con ese nombre');
    return this.opciones.guardar(opcion);
  }
}
