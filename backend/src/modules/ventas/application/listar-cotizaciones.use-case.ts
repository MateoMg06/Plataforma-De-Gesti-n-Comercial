import { Inject, Injectable } from '@nestjs/common';
import type { Cotizacion } from '../domain/cotizacion.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';

// HU-27: lista las cotizaciones para la pantalla /cotizaciones.
@Injectable()
export class ListarCotizacionesUseCase {
  constructor(@Inject(COTIZACION_REPOSITORY) private readonly repo: CotizacionRepository) {}

  ejecutar(): Promise<Cotizacion[]> {
    return this.repo.listar();
  }
}
