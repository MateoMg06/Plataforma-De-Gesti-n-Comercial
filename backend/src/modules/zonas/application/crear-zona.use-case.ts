import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Zona } from '../domain/zona.js';
import { ZONA_REPOSITORY, type ZonaRepository } from '../domain/zona.repository.js';

// Caso de uso: una acción del usuario. Orquesta el dominio a través del puerto.
@Injectable()
export class CrearZonaUseCase {
  constructor(@Inject(ZONA_REPOSITORY) private readonly zonas: ZonaRepository) {}

  async ejecutar(nombre: string): Promise<Zona> {
    const zona = Zona.crear(nombre);
    if (await this.zonas.buscarPorNombre(zona.nombre)) {
      throw new ConflictException(`Ya existe la zona ${zona.nombre}`);
    }
    return this.zonas.guardar(zona);
  }
}
