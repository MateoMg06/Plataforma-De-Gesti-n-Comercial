import { Inject, Injectable } from '@nestjs/common';
import type { Seguimiento } from '../domain/seguimiento.js';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';

// HU-24: cada pendiente lleva "vencido" para que la pantalla lo resalte.
export type SeguimientoPendiente = Seguimiento & { vencido: boolean };

@Injectable()
export class ListarSeguimientosPendientesUseCase {
  constructor(@Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository) {}

  // Pendientes = los que aún no se han completado (ya vienen ordenados por fecha_proxima).
  async ejecutar(): Promise<SeguimientoPendiente[]> {
    const todos = await this.seguimientos.listar();
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
