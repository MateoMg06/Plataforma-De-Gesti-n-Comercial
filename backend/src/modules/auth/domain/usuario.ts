import { UserRole } from '../../../common/enums/domain.enums.js';

// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas del negocio del usuario: qué roles existen y qué puede hacer.
export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly correo: string,
    public readonly rol: UserRole,
    public readonly activo: boolean,
  ) {}

  // Convierte los datos que trae la sesión en un Usuario.
  // Si el rol guardado no es uno del negocio, el usuario pierde privilegios:
  // por defecto se trata como asesor, que es el que ve menos cosas.
  static desdeSesion(datos: {
    id: string;
    nombre: string;
    correo: string;
    rol?: string | null;
    activo?: boolean | null;
  }): Usuario {
    return new Usuario(
      datos.id,
      datos.nombre,
      datos.correo,
      Usuario.resolverRol(datos.rol),
      datos.activo ?? true,
    );
  }

  // Un usuario desactivado no entra, aunque su rol esté en la lista pedida.
  puedeAccederA(roles: UserRole[]): boolean {
    return this.activo && roles.includes(this.rol);
  }

  // HU-03: el asesor solo ve sus propias rutas, visitas y clientes.
  esAsesor(): boolean {
    return this.rol === UserRole.ASESOR;
  }

  private static resolverRol(texto: string | null | undefined): UserRole {
    const valor = (texto ?? '').trim().toLowerCase();
    const encontrado = Object.values(UserRole).find((rol) => rol === valor);
    return encontrado ?? UserRole.ASESOR;
  }
}
