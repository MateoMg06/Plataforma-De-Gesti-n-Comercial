// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas del negocio.
export class Zona {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
  ) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre de la zona es obligatorio');
    }
    if (nombre.length > 100) {
      throw new Error('El nombre admite máximo 100 caracteres');
    }
  }

  renombrar(nombre: string): Zona {
    return new Zona(this.id, nombre.trim());
  }

  static crear(nombre: string): Zona {
    return new Zona(null, nombre.trim());
  }
}
