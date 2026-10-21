export class Potencial {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
    public readonly orden: number,
  ) {
    if (!nombre.trim()) throw new Error('El nombre es obligatorio');
    if (nombre.length > 100)
      throw new Error('El nombre admite máximo 100 caracteres');
    if (!Number.isInteger(orden) || orden < 0 || orden > 2147483647)
      throw new Error('El orden debe ser un entero entre 0 y 2147483647');
  }

  static crear(nombre: string, orden: number): Potencial {
    return new Potencial(null, nombre.trim(), orden);
  }

  editar(nombre: string, orden: number): Potencial {
    return new Potencial(this.id, nombre.trim(), orden);
  }
}
