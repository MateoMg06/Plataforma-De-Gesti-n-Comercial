import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cotizacion } from '../domain/cotizacion.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';

@Injectable()
export class AprobarCotizacionUseCase {
  constructor(@Inject(COTIZACION_REPOSITORY) private readonly repo: CotizacionRepository) {}
  async ejecutar(id: number): Promise<Cotizacion> {
    const c = await this.repo.buscarPorId(id);
    if (!c) throw new NotFoundException('Cotización no encontrada');
    let nueva: Cotizacion;
    try { nueva = c.aprobar(); } catch (e) { if (e instanceof Error) throw new BadRequestException(e.message); throw e; }
    return this.repo.guardar(nueva);
  }
}
