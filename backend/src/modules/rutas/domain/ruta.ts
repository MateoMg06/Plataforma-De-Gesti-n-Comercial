// Entidad de dominio: contiene las reglas propias de una ruta.
export class ClienteEnRuta {
  constructor(
    public readonly idCliente: number,
    public ordenVisita: number,
  ) {}
}

export class Ruta {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
    public readonly idAsesor: number,
    public readonly fechaInicio: string,
    public readonly fechaFin: string,
    public readonly estado: 'planeada' | 'activa' | 'finalizada' = 'planeada',
    public readonly clientes: ClienteEnRuta[] = [],
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

  agregarCliente(idCliente: number): void {
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      throw new Error('El cliente no es válido');
    }
    if (this.clientes.some((cliente) => cliente.idCliente === idCliente)) {
      throw new Error('El cliente ya está agregado a esta ruta');
    }
    this.clientes.push(new ClienteEnRuta(idCliente, this.clientes.length + 1));
  }

  reordenarCliente(idCliente: number, nuevoOrden: number): void {
    if (!Number.isInteger(nuevoOrden) || nuevoOrden < 1 || nuevoOrden > this.clientes.length) {
      throw new Error('El orden de visita no es válido');
    }
    const indiceActual = this.clientes.findIndex((cliente) => cliente.idCliente === idCliente);
    if (indiceActual === -1) throw new Error('El cliente no pertenece a esta ruta');

    const [cliente] = this.clientes.splice(indiceActual, 1);
    this.clientes.splice(nuevoOrden - 1, 0, cliente);
    this.clientes.forEach((item, indice) => {
      item.ordenVisita = indice + 1;
    });
  }

  private esFechaValida(fecha: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);
    return !Number.isNaN(fechaParseada.getTime()) && fechaParseada.toISOString().slice(0, 10) === fecha;
  }
}
