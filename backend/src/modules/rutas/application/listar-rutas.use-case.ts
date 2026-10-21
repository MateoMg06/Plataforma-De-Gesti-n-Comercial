import { Inject, Injectable } from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import type { Ruta } from '../domain/ruta.js';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

@Injectable()
export class ListarRutasUseCase {
  constructor(
    @Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository,
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
  ) {}

  // HU-03: el asesor solo ve sus rutas; administrador y líder ven todas.
  async ejecutar(usuario?: { id: string; role?: string | null }): Promise<Ruta[]> {
    const rutas = await this.rutas.listar();
    if (usuario?.role !== 'asesor') return rutas;
    const asesor = await this.obtenerAsesorPorUsuario.ejecutar(usuario.id);
    return rutas.filter((r) => r.idAsesor === asesor.id);
  }
}
