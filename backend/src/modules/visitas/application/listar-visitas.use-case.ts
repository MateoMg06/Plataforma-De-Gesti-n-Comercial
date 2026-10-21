import { Inject, Injectable } from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import type { Visita } from '../domain/visita.js';
import { VISITA_REPOSITORY, type VisitaRepository } from '../domain/visita.repository.js';

@Injectable()
export class ListarVisitasUseCase {
  constructor(
    @Inject(VISITA_REPOSITORY) private readonly visitas: VisitaRepository,
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
  ) {}

  // HU-03: el asesor solo ve sus visitas; administrador y líder ven todas.
  // Sin usuario (por ejemplo, cuando lo llama otro módulo) devuelve todas.
  async ejecutar(usuario?: { id: string; role?: string | null }): Promise<Visita[]> {
    const visitas = await this.visitas.listar();
    if (usuario?.role !== 'asesor') return visitas;
    const asesor = await this.obtenerAsesorPorUsuario.ejecutar(usuario.id);
    return visitas.filter((v) => v.idAsesor === asesor.id);
  }
}
