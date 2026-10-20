// Entidad de dominio: contiene las reglas propias de una ruta.
export class Ruta {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
    public readonly idAsesor: number,
    public readonly fechaInicio: string,
    public readonly fechaFin: string,
    public readonly estado: 'planeada' | 'activa' | 'finalizada' = 'planeada',
  ) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre de la ruta es obligatorio');
    }
    if (nombre.trim().length > 100) {
      throw new Error('El nombre de la ruta no puede superar 100 caracteres');
    }
    if (!Number.isInteger(idAsesor) || idAsesor <= 0) {
      throw new Error('El asesor de la ruta no es válido');
    }
    if (!this.esFechaValida(fechaInicio) || !this.esFechaValida(fechaFin)) {
      throw new Error('Las fechas de la ruta no son válidas');
    }
    if (fechaFin < fechaInicio) {
      throw new Error('La fecha de fin debe ser igual o posterior a la fecha de inicio');
    }
  }

  static crear(
    nombre: string,
    idAsesor: number,
    fechaInicio: string,
    fechaFin: string,
  ): Ruta {
    return new Ruta(null, nombre.trim(), idAsesor, fechaInicio, fechaFin);
  }

  private esFechaValida(fecha: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);
    return !Number.isNaN(fechaParseada.getTime()) && fechaParseada.toISOString().slice(0, 10) === fecha;
  }
}
