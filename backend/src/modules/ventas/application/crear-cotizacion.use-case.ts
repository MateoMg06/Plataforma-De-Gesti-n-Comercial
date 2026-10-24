import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cotizacion, CotizacionDetalle } from '../domain/cotizacion.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';

export interface DetalleInput {
  producto: string;
  cantidad: number;
  precio: number;
}

@Injectable()
export class CrearCotizacionUseCase {
  constructor(
    @Inject(COTIZACION_REPOSITORY) private readonly repo: CotizacionRepository,
  ) {}

  async ejecutar(idCliente: number, idAsesor: number, detalles: DetalleInput[]): Promise<Cotizacion> {
    const numero = await this.repo.obtenerSiguienteNumero();
    let cotizacionDetalles;
    try {
      cotizacionDetalles = detalles.map((d) =>
        CotizacionDetalle.crear(d.producto, d.cantidad, d.precio),
      );
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    let cotizacion: Cotizacion;
    try {
      cotizacion = Cotizacion.crear(numero, idCliente, idAsesor, cotizacionDetalles);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.repo.guardar(cotizacion);
  }
}
