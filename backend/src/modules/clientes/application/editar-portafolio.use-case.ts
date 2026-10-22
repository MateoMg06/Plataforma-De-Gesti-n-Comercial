import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Portafolio } from '../domain/portafolio.js';
import {
  PORTAFOLIO_REPOSITORY,
  type PortafolioRepository,
} from '../domain/portafolio.repository.js';

@Injectable()
export class EditarPortafolioUseCase {
  constructor(
    @Inject(PORTAFOLIO_REPOSITORY)
    private readonly portafolios: PortafolioRepository,
  ) {}

  async ejecutar(
    id: number,
    nombre: string,
    descripcion: string,
  ): Promise<Portafolio> {
    const actual = await this.portafolios.buscarPorId(id);
    if (!actual) throw new NotFoundException('El portafolio no existe');
    let editado: Portafolio;
    try {
      editado = actual.editar(nombre, descripcion);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetido = await this.portafolios.buscarPorNombre(editado.nombre);
    if (repetido && repetido.id !== id)
      throw new ConflictException('Ya existe un portafolio con ese nombre');
    return this.portafolios.guardar(editado);
  }
}
