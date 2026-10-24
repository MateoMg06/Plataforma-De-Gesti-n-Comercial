import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  type ZonaRepository,
} from '../domain/zona.repository.js';
import { Zona } from '../domain/zona.js';

@Injectable()
export class EditarZonaUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY) private readonly zonas: ZonaRepository,
  ) {}

  async ejecutar(id: number, nombre: string): Promise<Zona> {
    const zona = await this.zonas.buscarPorId(id);
    if (!zona) throw new NotFoundException('La zona no existe');
    let editada: Zona;
    try {
      editada = zona.renombrar(nombre);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetida = await this.zonas.buscarPorNombre(editada.nombre);
    if (repetida && repetida.id !== id)
      throw new ConflictException('Ya existe una zona con ese nombre');
    return this.zonas.guardar(editada);
  }
}
