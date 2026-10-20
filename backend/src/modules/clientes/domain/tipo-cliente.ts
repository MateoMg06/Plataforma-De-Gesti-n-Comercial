export class TipoCliente {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
  ) {
    if (!nombre.trim()) throw new Error('El nombre es obligatorio');
    if (nombre.length > 100)
      throw new Error('El nombre admite máximo 100 caracteres');
  }

  static crear(nombre: string): TipoCliente {
    return new TipoCliente(null, nombre.trim());
  }

  editar(nombre: string): TipoCliente {
    return new TipoCliente(this.id, nombre.trim());
  }
}
