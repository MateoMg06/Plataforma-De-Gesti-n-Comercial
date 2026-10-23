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

  // HU-24: marcar completado registra la fecha y el usuario. No se completa dos veces.
  completar(idUsuario: string, fecha: Date): Seguimiento {
    if (this.completado) {
      throw new Error('El seguimiento ya está completado');
    }
    return new Seguimiento(
      this.id,
      this.id_visita,
      this.fecha_proxima,
      this.actividad,
      this.observacion,
      true,
      fecha.toISOString(),
      idUsuario,
    );
  }

  // HU-24: vencido = sigue pendiente y su fecha próxima ya pasó (hoy en formato AAAA-MM-DD).
  estaVencido(hoy: string): boolean {
    return !this.completado && this.fecha_proxima < hoy;
  }

  static crear(id_visita: number, fecha_proxima: string, actividad: string, observacion: string): Seguimiento {
    return new Seguimiento(null, id_visita, fecha_proxima, actividad, observacion, false, null, null);
  }
}