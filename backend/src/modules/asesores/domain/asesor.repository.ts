import type { Asesor } from './asesor.js';

// Puerto: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
export interface AsesorRepository {
  guardar(asesor: Asesor): Promise<Asesor>;
  listar(): Promise<Asesor[]>;
  buscarPorId(id: number): Promise<Asesor | null>;
  buscarPorCorreo(correo: string): Promise<Asesor | null>;
  // HU-12: el asesor vinculado al usuario que inició sesión (columna id_usuario).
  buscarPorIdUsuario(idUsuario: string): Promise<Asesor | null>;
}

// Token para inyectar la interfaz (las interfaces no existen en tiempo de ejecución).
export const ASESOR_REPOSITORY = Symbol('ASESOR_REPOSITORY');
