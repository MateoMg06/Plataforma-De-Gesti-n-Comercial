import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Ruta } from '../domain/ruta.js';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

// HU-16: pasa una ruta activa a finalizada. Desde ahí no admite cambios.
@Injectable()
export class FinalizarRutaUseCase {
  constructor(@Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository) {}

  async ejecutar(idRuta: number): Promise<Ruta> {
    const ruta = await this.rutas.buscarPorId(idRuta);
    if (!ruta) throw new NotFoundException(`No existe la ruta ${idRuta}`);

    let finalizada: Ruta;
    try {
      finalizada = ruta.finalizar();
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.rutas.guardar(finalizada);
  }
}
