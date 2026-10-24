export class EstadoCliente {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
  ) {
    if (!nombre.trim()) throw new Error('El nombre es obligatorio');
    if (nombre.length > 100)
      throw new Error('El nombre admite máximo 100 caracteres');
  }

  static crear(nombre: string): EstadoCliente {
    return new EstadoCliente(null, nombre.trim());
  }

  editar(nombre: string): EstadoCliente {
    return new EstadoCliente(this.id, nombre.trim());
  }
}
