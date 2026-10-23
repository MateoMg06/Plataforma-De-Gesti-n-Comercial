import { Inject, Injectable } from '@nestjs/common';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import type { Seguimiento } from '../domain/seguimiento.js';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';

// HU-24: cada pendiente lleva "vencido" para que la pantalla lo resalte.
export type SeguimientoPendiente = Seguimiento & { vencido: boolean };

@Injectable()
export class ListarSeguimientosPendientesUseCase {
  constructor(
    @Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository,
    private readonly listarVisitas: ListarVisitasUseCase,
  ) {}

  // Pendientes = los que aún no se han completado (ya vienen ordenados por fecha_proxima).
  // HU-03: el asesor solo ve los de sus visitas (el seguimiento no guarda asesor: es el de su visita).
  async ejecutar(usuario?: { id: string; role?: string | null }): Promise<SeguimientoPendiente[]> {
    let todos = await this.seguimientos.listar();
    if (usuario?.role === 'asesor') {
      const susVisitas = new Set((await this.listarVisitas.ejecutar(usuario)).map((v) => v.id));
      todos = todos.filter((s) => susVisitas.has(s.id_visita));
    }
    const hoy = fechaLocal(new Date());
    return todos
      .filter((s) => !s.completado)
      .map((s) => Object.assign(s, { vencido: s.estaVencido(hoy) }));
  }
}

// AAAA-MM-DD en la hora del servidor (toISOString usaría UTC y en Colombia
// cambiaría de día a las 7 pm).
function fechaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}
