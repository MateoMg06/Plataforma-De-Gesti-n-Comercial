// Puerto: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
import type { FiltrosBitacora, RegistroBitacora } from './registro-bitacora.js';

export interface BitacoraRepository {
  // Del más reciente al más antiguo.
  consultar(filtros: FiltrosBitacora): Promise<RegistroBitacora[]>;
}

// Token para inyectar la interfaz en el caso de uso.
export const BITACORA_REPOSITORY = Symbol('BITACORA_REPOSITORY');
