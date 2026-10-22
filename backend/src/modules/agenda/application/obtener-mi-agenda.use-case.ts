import { Injectable } from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';

// HU-12 · Mi agenda: el asesor que inició sesión ve solo sus visitas.
// Este módulo no tiene tablas propias: usa los casos de uso que exportan
// asesores (Mateo) y visitas (Santiago), sin tocar sus repositorios.
@Injectable()
export class ObtenerMiAgendaUseCase {
  constructor(
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
    private readonly listarVisitas: ListarVisitasUseCase,
  ) {}

  async ejecutar(idUsuario: string) {
    // Lanza 404 si el usuario no tiene un asesor vinculado.
    const asesor = await this.obtenerAsesorPorUsuario.ejecutar(idUsuario);
    const visitas = await this.listarVisitas.ejecutar();
    return {
      asesor: { id: asesor.id, nombre: asesor.nombre },
      visitas: visitas.filter((v) => v.idAsesor === asesor.id),
    };
  }
}
