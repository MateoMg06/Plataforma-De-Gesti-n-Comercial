import { Inject, Injectable } from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import type { Cotizacion } from '../domain/cotizacion.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';

// HU-27: lista las cotizaciones para la pantalla /cotizaciones.
@Injectable()
export class ListarCotizacionesUseCase {
  constructor(
    @Inject(COTIZACION_REPOSITORY) private readonly repo: CotizacionRepository,
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
  ) {}

  // HU-03: con rol asesor solo devuelve las suyas. Sin usuario (dashboard,
  // reportes, historial) devuelve todas: esos casos filtran por su cuenta.
  async ejecutar(usuario?: { id: string; role?: string | null }): Promise<Cotizacion[]> {
    const cotizaciones = await this.repo.listar();
    if (usuario?.role !== 'asesor') return cotizaciones;
    const asesor = await this.obtenerAsesorPorUsuario.ejecutar(usuario.id);
    return cotizaciones.filter((c) => c.idAsesor === asesor.id);
  }
}
