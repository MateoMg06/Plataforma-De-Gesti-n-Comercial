import { AsesorEstado } from '../../../common/enums/domain.enums.js';

// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas del negocio del asesor.
export class Asesor {
  constructor(
    public readonly id: number | null,
    public readonly nombre: string,
    public readonly correo: string,
    public readonly telefono: string,
    public readonly estado: AsesorEstado,
    // Usuario de BetterAuth con el que inicia sesión (null = aún sin usuario).
    public readonly idUsuario: string | null = null,
  ) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del asesor es obligatorio');
    }
    if (!correo || correo.trim().length === 0) {
      throw new Error('El correo del asesor es obligatorio');
    }
    if (!telefono || telefono.trim().length === 0) {
      throw new Error('El teléfono del asesor es obligatorio');
    }
  }

  // Todo asesor nuevo empieza activo.
  static crear(nombre: string, correo: string, telefono: string, idUsuario: string | null = null): Asesor {
    return new Asesor(
      null,
      nombre.trim(),
      correo.trim().toLowerCase(),
      telefono.trim(),
      AsesorEstado.ACTIVO,
      idUsuario,
    );
  }

  // Devuelve un asesor nuevo con los datos cambiados; el estado se conserva.
  actualizar(nombre: string, correo: string, telefono: string, idUsuario: string | null = this.idUsuario): Asesor {
    return new Asesor(
      this.id,
      nombre.trim(),
      correo.trim().toLowerCase(),
      telefono.trim(),
      this.estado,
      idUsuario,
    );
  }

  cambiarEstado(estado: AsesorEstado): Asesor {
    return new Asesor(this.id, this.nombre, this.correo, this.telefono, estado, this.idUsuario);
  }

  // HU-10: los asesores inactivos no reciben rutas nuevas.
  puedeRecibirRutas(): boolean {
    return this.estado === AsesorEstado.ACTIVO;
  }
}
