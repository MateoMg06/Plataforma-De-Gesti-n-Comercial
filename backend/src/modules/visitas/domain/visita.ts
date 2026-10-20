// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas del negocio de una visita.

// Estados válidos de una visita (ver docs/modelo-datos.md).
export type EstadoVisita =
  | 'programada'
  | 'realizada'
  | 'cancelada'
  | 'no_atendida'
  | 'reprogramada';

export class Visita {
  constructor(
    public readonly id: number | null,
    public readonly idCliente: number,
    public readonly idAsesor: number,
    public readonly idRuta: number | null,
    public readonly fechaProgramada: Date,
    public readonly estado: EstadoVisita,
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
}
