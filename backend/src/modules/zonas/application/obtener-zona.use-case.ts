import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  type ZonaRepository,
} from '../domain/zona.repository.js';

@Injectable()
export class ObtenerZonaUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY) private readonly zonas: ZonaRepository,
  ) {}

  async ejecutar(id: number) {
    const zona = await this.zonas.buscarPorId(id);
    if (!zona) throw new NotFoundException('La zona no existe');
    return zona;
  }
}
