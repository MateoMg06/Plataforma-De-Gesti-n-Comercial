// HU-09: una línea del portafolio de productos o servicios de la empresa.
export class Portafolio {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
    public readonly descripcion: string,
  ) {
    if (!nombre.trim()) throw new Error('El nombre es obligatorio');
    if (nombre.length > 100)
      throw new Error('El nombre admite máximo 100 caracteres');
    if (descripcion.length > 255)
      throw new Error('La descripción admite máximo 255 caracteres');
  }

  static crear(nombre: string, descripcion: string): Portafolio {
    return new Portafolio(null, nombre.trim(), descripcion.trim());
  }

  editar(nombre: string, descripcion: string): Portafolio {
    return new Portafolio(this.id, nombre.trim(), descripcion.trim());
  }
}

// Una línea del portafolio que un cliente tiene asignada, con su fecha de registro.
export type PortafolioDeCliente = {
  idPortafolio: number;
  nombre: string;
  descripcion: string;
  fechaRegistro: Date;
};
