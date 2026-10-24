import { ConflictException, Inject, Injectable } from '@nestjs/common';
// Caso de uso: una acción del usuario (crear un seguimiento).
// Orquesta el dominio a través del puerto (repositorio).
// Recibe: id_visita, fecha_proxima, actividad, observacion.
import { Seguimiento } from '../domain/seguimiento.js';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';

@Injectable()
export class CrearSeguimientoUseCase {
  constructor(@Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository) {}

  async ejecutar(id_visita: number, fecha_proxima: string, actividad: string, observacion: string): Promise<Seguimiento> {
    const seguimiento = Seguimiento.crear(id_visita, fecha_proxima, actividad, observacion);
    return this.seguimientos.guardar(seguimiento);
  }
}