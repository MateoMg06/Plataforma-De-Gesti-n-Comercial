// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas del negocio de una visita.

// Estados válidos de una visita (ver docs/modelo-datos.md).
export type EstadoVisita =
  | 'programada'
  | 'realizada'
  | 'cancelada'
  | 'no_atendida'
  | 'reprogramada';

// Estados que se pueden registrar al dar el resultado de una visita (HU-19).
export type EstadoResultado = 'realizada' | 'cancelada' | 'no_atendida';

export class Visita {
  constructor(
    public readonly id: number | null,
    public readonly idCliente: number,
    public readonly idAsesor: number,
    public readonly idRuta: number | null,
    public readonly fechaProgramada: Date,
    public readonly estado: EstadoVisita,
    public readonly fechaReal: Date | null = null,
    // HU-13: por qué se cambió la fecha. Solo lo tienen las visitas reprogramadas.
    public readonly motivoReprogramacion: string | null = null,
  ) {
    if (!idCliente || idCliente <= 0) {
      throw new Error('El cliente es obligatorio');
    }
    if (!idAsesor || idAsesor <= 0) {
      throw new Error('El asesor es obligatorio');
    }
    if (!fechaProgramada || Number.isNaN(fechaProgramada.getTime())) {
      throw new Error('La fecha programada es obligatoria');
    }
  }

  // Toda visita nueva nace en estado 'programada' (HU-18).
  // La ruta es opcional: se puede programar una visita sin ruta.
  static crear(
    idCliente: number,
    idAsesor: number,
    fechaProgramada: Date,
    idRuta: number | null = null,
  ): Visita {
    return new Visita(null, idCliente, idAsesor, idRuta, fechaProgramada, 'programada');
  }

  // HU-19: registra el resultado de la visita. Cambia el estado y fija la fecha real.
  // Regla: una visita 'realizada' no se puede editar.
  registrarResultado(fechaReal: Date, estado: EstadoResultado): Visita {
    if (this.estado === 'realizada') {
      throw new Error('Una visita realizada no se puede editar');
    }
    if (!fechaReal || Number.isNaN(fechaReal.getTime())) {
      throw new Error('La fecha real es obligatoria');
    }
    return new Visita(
      this.id,
      this.idCliente,
      this.idAsesor,
      this.idRuta,
      this.fechaProgramada,
      estado,
      fechaReal,
      this.motivoReprogramacion,
    );
  }

  // HU-13: cambia la fecha programada indicando el motivo.
  // Regla: solo se reprograma una visita pendiente (programada o ya reprogramada).
  reprogramar(nuevaFecha: Date, motivo: string): Visita {
    if (this.estado !== 'programada' && this.estado !== 'reprogramada') {
      throw new Error('Solo se puede reprogramar una visita pendiente');
    }
    if (!nuevaFecha || Number.isNaN(nuevaFecha.getTime())) {
      throw new Error('La nueva fecha es obligatoria');
    }
    const texto = (motivo ?? '').trim();
    if (!texto) throw new Error('El motivo de la reprogramación es obligatorio');
    if (texto.length > 255) throw new Error('El motivo admite máximo 255 caracteres');
    return new Visita(
      this.id,
      this.idCliente,
      this.idAsesor,
      this.idRuta,
      nuevaFecha,
      'reprogramada',
      null,
      texto,
    );
  }
}
