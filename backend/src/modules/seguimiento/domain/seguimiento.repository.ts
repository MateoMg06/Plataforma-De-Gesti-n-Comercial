// Puerto: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
import type { Seguimiento } from './seguimiento.js';

export interface SeguimientoRepository {
  guardar(seguimiento: Seguimiento): Promise<Seguimiento>;
  listar(): Promise<Seguimiento[]>;
  buscarPorId(id: number): Promise<Seguimiento | null>;
}

// Token para inyectar la interfaz en el caso de uso (las interfaces no existen en tiempo de ejecución).
// Se usa en el provider del módulo: { provide: SEGUIMIENTO_REPOSITORY, useClass: TypeOrmSeguimientoRepository }
export const SEGUIMIENTO_REPOSITORY = Symbol('SEGUIMIENTO_REPOSITORY');