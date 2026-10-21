// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas de negocio del seguimiento.
// Reglas: completado es false por defecto; actividad es obligatoria.
export class Seguimiento {
  constructor(
    public readonly id: number | null,
    public readonly id_visita: number,
    public readonly fecha_proxima: string,
    public readonly actividad: string,
    public readonly observacion: string,
    public completado: boolean,
    public readonly fecha_completado: string | null,
    public readonly completado_por: string | null,
  ) {
    if (!actividad || actividad.trim().length === 0) {
      throw new Error('La actividad es obligatoria');
    }
    if (completado && (!fecha_completado || !completado_por)) {
      throw new Error('Si el seguimiento está completado, deben tener fecha_completado y completado_por');
    }
  }

  static crear(id_visita: number, fecha_proxima: string, actividad: string, observacion: string): Seguimiento {
    return new Seguimiento(null, id_visita, fecha_proxima, actividad, observacion, false, null, null);
  }
}