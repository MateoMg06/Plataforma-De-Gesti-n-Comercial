import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { FUENTE_DATOS_REPORTE, type FuenteDatosReporte } from '../domain/fuente-datos-reporte.js';
import { type FiltrosReporte, Reporte } from '../domain/reporte.js';

// HU-33: reporte de visitas, cotizaciones y pedidos con filtros y totales.
// Las reglas (filtrar y totalizar) están en el dominio: aquí solo se juntan los datos.
@Injectable()
export class ConsultarReporteUseCase {
  constructor(@Inject(FUENTE_DATOS_REPORTE) private readonly fuente: FuenteDatosReporte) {}

  async ejecutar(filtros: FiltrosReporte): Promise<Reporte> {
    const datos = await this.fuente.obtener();
    try {
      return Reporte.generar(datos, filtros);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
