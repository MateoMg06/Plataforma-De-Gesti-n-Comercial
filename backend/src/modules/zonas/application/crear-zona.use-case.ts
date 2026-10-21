import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Zona } from '../domain/zona.js';
import {
  ZONA_REPOSITORY,
  type ZonaRepository,
} from '../domain/zona.repository.js';

// Caso de uso: una acción del usuario. Orquesta el dominio a través del puerto.
@Injectable()
export class CrearZonaUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY) private readonly zonas: ZonaRepository,
  ) {}

  async ejecutar(nombre: string): Promise<Zona> {
    let zona: Zona;
    try {
      zona = Zona.crear(nombre);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    if (await this.zonas.buscarPorNombre(zona.nombre)) {
      throw new ConflictException(`Ya existe la zona ${zona.nombre}`);
    }
    return this.zonas.guardar(zona);
  }
}
